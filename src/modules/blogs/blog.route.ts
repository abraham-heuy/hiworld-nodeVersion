import { Router } from 'express';
import { AppDataSource } from '../../database/data-source';
import { protect } from '../../middleware/auth.middleware';
import { BlogController } from './blog.handler';
import { BlogService } from './blog.service';

const router = Router();

const blogService = new BlogService(
  AppDataSource.getRepository('Blog'),
  AppDataSource.getRepository('BlogComment'),
  AppDataSource.getRepository('Category'),
  AppDataSource.getRepository('User'),
  AppDataSource.getRepository('Friend')
);
const blogController = new BlogController(blogService);

// Categories
router.get('/categories', blogController.getCategories);

// Public blog endpoints
router.get('/', blogController.getBlogs);
router.get('/:id', blogController.getBlog);
router.get('/:id/comments', blogController.getComments);

// Protected blog actions
router.post('/', protect, blogController.createBlog);
router.patch('/:id', protect, blogController.updateBlog);
router.delete('/:id', protect, blogController.deleteBlog);
router.post('/:id/kudos', protect, blogController.giveKudos);

// Comments
router.post('/:id/comments', protect, blogController.addComment);
router.patch('/comments/:commentId', protect, blogController.updateComment);
router.delete('/comments/:commentId', protect, blogController.deleteComment);

export default router;