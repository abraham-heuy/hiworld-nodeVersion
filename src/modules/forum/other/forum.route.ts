import { Router } from 'express';
import { AppDataSource } from '../../../database/data-source';
import { ForumCategory } from '../../../entities/forums/forum-category.entity';
import { ForumModerator } from '../../../entities/forums/forum-moderator.entity';
import { ForumPost } from '../../../entities/forums/forum-post.entity';
import { ForumTopic } from '../../../entities/forums/forum-topic.entity';
import { User } from '../../../entities/user.entity';
import { protect, requireRank } from '../../../middleware/auth.middleware';
import { ForumCategoryService } from '../services/forum-category.service';
import { ForumModeratorService } from '../services/forum-moderator.service';
import { ForumPostService } from '../services/forum-post.service';
import { ForumTopicService } from '../services/forum-topic.service';
import { ForumCategoryController } from './handlers/forum-category.handlers';
import { ForumModeratorController } from './handlers/forum-moderator.handler';
import { ForumPostController } from './handlers/forum-post.handler';
import { ForumTopicController } from './handlers/forum-topic.controller';

const router = Router();

// Get typed repositories
const categoryRepo = AppDataSource.getRepository(ForumCategory);
const topicRepo = AppDataSource.getRepository(ForumTopic);
const postRepo = AppDataSource.getRepository(ForumPost);
const moderatorRepo = AppDataSource.getRepository(ForumModerator);
const userRepo = AppDataSource.getRepository(User);

// Initialize services (ensure constructor argument counts match)
const categoryService = new ForumCategoryService(categoryRepo);
const topicService = new ForumTopicService(topicRepo, categoryRepo, postRepo, moderatorRepo);
const postService = new ForumPostService(postRepo, topicRepo, moderatorRepo);
const moderatorService = new ForumModeratorService(moderatorRepo, userRepo, categoryRepo);

// Initialize controllers
const categoryController = new ForumCategoryController(categoryService);
const topicController = new ForumTopicController(topicService);
const postController = new ForumPostController(postService);
const moderatorController = new ForumModeratorController(moderatorService);

// ========== CATEGORIES ==========
router.post('/categories', protect, requireRank(5), categoryController.createCategory);
router.put('/categories/:id', protect, requireRank(5), categoryController.updateCategory);
router.delete('/categories/:id', protect, requireRank(5), categoryController.deleteCategory);
router.get('/categories', categoryController.getCategories);
router.get('/categories/:id', categoryController.getCategory);

// ========== TOPICS ==========
router.post('/topics', protect, topicController.createTopic);
router.put('/topics/:id', protect, topicController.updateTopic);
router.delete('/topics/:id', protect, topicController.deleteTopic);
router.get('/categories/:categoryId/topics', topicController.getTopicsByCategory);
router.get('/topics/:id', topicController.getTopic);

// ========== POSTS ==========
router.post('/topics/:topicId/posts', protect, postController.createPost);
router.put('/posts/:id', protect, postController.updatePost);
router.delete('/posts/:id', protect, postController.deletePost);
router.post('/posts/:id/vote', protect, postController.votePost);
router.get('/topics/:topicId/posts', postController.getPostsByTopic);
router.get('/posts/:id', postController.getPost);

// ========== MODERATORS ==========
router.post('/categories/:categoryId/moderators', protect, requireRank(10), moderatorController.addModerator);
router.delete('/categories/:categoryId/moderators/:userId', protect, requireRank(10), moderatorController.removeModerator);
router.get('/categories/:categoryId/moderators', moderatorController.getModeratorsByCategory);

export default router;