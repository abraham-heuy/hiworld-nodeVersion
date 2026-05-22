import { Request, Response, NextFunction } from 'express';
import { SendMessageDto } from '../../dtos/message.dto';
import { MessageService } from './message.service';

export class MessageController {
  constructor(private messageService: MessageService) {}

  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: SendMessageDto = req.body;
      const message = await this.messageService.sendMessage(req.authenticatedUser!.id, dto);
      res.status(201).json(message);
    } catch (error) { next(error); }
  };

  getConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const { messages, total } = await this.messageService.getConversation(req.authenticatedUser!.id, userId, page, limit);
      res.json({ messages, total, page, limit });
    } catch (error) { next(error); }
  };

  getConversationList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversations = await this.messageService.getConversationList(req.authenticatedUser!.id);
      res.json(conversations);
    } catch (error) { next(error); }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messageId } = req.params;
      await this.messageService.markAsRead(messageId, req.authenticatedUser!.id);
      res.json({ message: 'Message marked as read' });
    } catch (error) { next(error); }
  };

  deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messageId } = req.params;
      const isAdmin = (req.authenticatedUser?.rank ?? 0) >= 10;
      await this.messageService.deleteMessage(messageId, req.authenticatedUser!.id, isAdmin);
      res.json({ message: 'Message deleted' });
    } catch (error) { next(error); }
  };
}