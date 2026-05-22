import { Router } from 'express';
import { AppDataSource } from '../../database/data-source';
import { Favorite } from '../../entities/favorite.entity';
import { protect } from '../../middleware/auth.middleware';
import { FavoriteController } from './favorite.handler';
import { FavoriteService } from './favorite.service';

const router = Router();
const favoriteRepo = AppDataSource.getRepository(Favorite);
const favoriteService = new FavoriteService(favoriteRepo);
const favoriteController = new FavoriteController(favoriteService);

router.use(protect);
router.post('/add', favoriteController.addFavorite);
router.post('/remove', favoriteController.removeFavorite);
router.get('/', favoriteController.getFavorites);

export default router;