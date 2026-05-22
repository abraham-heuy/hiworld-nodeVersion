import { Router } from 'express';
import { AppDataSource } from '../../database/data-source';
import { Message } from '../../entities/message.entity';
import { User } from '../../entities/user.entity';
import { protect } from '../../middleware/auth.middleware';
import { MessageController } from './message.handlers';
import { MessageService } from './message.service';


const router = Router();

const messageRepo = AppDataSource.getRepository(Message);
const userRepo = AppDataSource.getRepository(User);
const messageService = new MessageService(messageRepo, userRepo);
const messageController = new MessageController(messageService);

// All endpoints require authentication
router.use(protect);

router.post('/', messageController.sendMessage);
router.get('/conversations', messageController.getConversationList);
router.get('/conversations/:userId', messageController.getConversation);
router.put('/:messageId/read', messageController.markAsRead);
router.delete('/:messageId', messageController.deleteMessage);

export default router;