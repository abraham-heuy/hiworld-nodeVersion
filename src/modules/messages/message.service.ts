import { Repository } from 'typeorm';
import { SendMessageDto } from '../../dtos/message.dto';
import { Message } from '../../entities/message.entity';
import { User } from '../../entities/user.entity';
import { NotFoundException, ForbiddenException } from '../../exceptions/HttpExceptions';
import { encrypt, decrypt } from '../../utils/crypto';

export class MessageService {
  constructor(
    private messageRepo: Repository<Message>,
    private userRepo: Repository<User>
  ) {}

  async sendMessage(senderId: string, dto: SendMessageDto): Promise<Message> {
    const receiver = await this.userRepo.findOne({ where: { id: dto.receiverId } });
    if (!receiver) throw new NotFoundException('Receiver not found');
    if (senderId === dto.receiverId) throw new ForbiddenException('Cannot send message to yourself');

    // Encrypt the message before storing
    const encryptedMsg = encrypt(dto.msg);

    const message = this.messageRepo.create({
      senderId,
      receiverId: dto.receiverId,
      msg: encryptedMsg,
      is_read: false,
    });
    return this.messageRepo.save(message);
  }

  async getConversation(userId: string, otherUserId: string, page = 1, limit = 50): Promise<{ messages: Message[]; total: number }> {
    const otherUser = await this.userRepo.findOne({ where: { id: otherUserId } });
    if (!otherUser) throw new NotFoundException('User not found');

    const [messages, total] = await this.messageRepo
      .createQueryBuilder('message')
      .where(
        '(message.senderId = :userId AND message.receiverId = :otherId) OR (message.senderId = :otherId AND message.receiverId = :userId)',
        { userId, otherId: otherUserId }
      )
      .orderBy('message.created_at', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Decrypt each message, fallback to error text if decryption fails
    const decryptedMessages = messages.map(msg => {
      let decryptedText: string;
      try {
        decryptedText = decrypt(msg.msg);
      } catch (err) {
        console.error(`Failed to decrypt message ${msg.id}:`, err);
        decryptedText = '[Message could not be decrypted]';
      }
      return { ...msg, msg: decryptedText };
    });

    // Mark messages as read where current user is receiver
    await this.messageRepo
      .createQueryBuilder()
      .update(Message)
      .set({ is_read: true })
      .where('receiverId = :userId AND senderId = :otherId AND is_read = false', { userId, otherId: otherUserId })
      .execute();

    return { messages: decryptedMessages as any, total };
  }

  async getConversationList(userId: string): Promise<any[]> {
    // Get raw conversation data (encrypted last message)
    const conversations = await this.messageRepo
      .createQueryBuilder('message')
      .select([
        'CASE WHEN message.senderId = :userId THEN message.receiverId ELSE message.senderId END AS otherUserId',
        'MAX(message.created_at) AS lastMessageDate',
        'SUBSTRING_INDEX(GROUP_CONCAT(message.msg ORDER BY message.created_at DESC), ",", 1) AS lastMessageEncrypted',
        'SUM(CASE WHEN message.receiverId = :userId AND message.is_read = false THEN 1 ELSE 0 END) AS unreadCount'
      ])
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .groupBy('otherUserId')
      .orderBy('lastMessageDate', 'DESC')
      .getRawMany();

    // Fetch user details and decrypt last message preview
    const enriched = [];
    for (const conv of conversations) {
      const user = await this.userRepo.findOne({
        where: { id: conv.otherUserId },
        select: ['id', 'username', 'pfp', 'status']
      });
      if (user) {
        let lastMessage = '';
        if (conv.lastMessageEncrypted) {
          try {
            lastMessage = decrypt(conv.lastMessageEncrypted);
            // Trim long messages for preview
            if (lastMessage.length > 50) lastMessage = lastMessage.slice(0, 50) + '...';
          } catch (err) {
            console.error(`Failed to decrypt last message for conversation with ${user.id}:`, err);
            lastMessage = '[encrypted message]';
          }
        }
        enriched.push({
          user,
          lastMessage,
          lastMessageDate: conv.lastMessageDate,
          unreadCount: parseInt(conv.unreadCount) || 0
        });
      }
    }
    return enriched;
  }

  async markAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.receiverId !== userId) throw new ForbiddenException('Cannot mark others messages as read');
    message.is_read = true;
    await this.messageRepo.save(message);
  }

  async deleteMessage(messageId: string, userId: string, isAdmin = false): Promise<void> {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId && message.receiverId !== userId && !isAdmin) {
      throw new ForbiddenException('You cannot delete this message');
    }
    await this.messageRepo.remove(message);
  }
}