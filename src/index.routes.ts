import { Express } from 'express';
import authRoute from './modules/auth/auth.route';
import userRoute from './modules/user/user.route';
import groupRoute from './modules/group/group.route';
import bulletinRoute from './modules/bulletins/bulletin.route';
import forumRoute from './modules/forum/other/forum.route';
import blogRoute from './modules/blogs/blog.route';
import messageRoutes from './modules/messages/message.routes';


const API_PREFIX = '/hiworld/api';

export function registerRoutes(app: Express): void {
  // All route modules will be mounted under the global prefix
  app.use(`${API_PREFIX}/auth`, authRoute);
  app.use(`${API_PREFIX}/profile`, userRoute);
  app.use(`${API_PREFIX}/groups`, groupRoute);
  app.use(`${API_PREFIX}/layouts`, authRoute);
  app.use(`${API_PREFIX}/bulletins`, bulletinRoute)
  app.use(`${API_PREFIX}/forums`, forumRoute)
  app.use(`${API_PREFIX}/blogs`, blogRoute)
  app.use(`${API_PREFIX}/messages`, messageRoutes);



}