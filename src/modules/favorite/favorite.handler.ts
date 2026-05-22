import { Request, Response, NextFunction } from 'express';
import { AddFavoriteDto, RemoveFavoriteDto } from '../../dtos/favorite.dto';
import { FavoriteService } from './favorite.service';

export class FavoriteController {
  constructor(private favoriteService: FavoriteService) {}

  addFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: AddFavoriteDto = req.body;
      const result = await this.favoriteService.addFavorite(req.authenticatedUser!.id, dto);
      res.json(result);
    } catch (error) { next(error); }
  };

  removeFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: RemoveFavoriteDto = req.body;
      const result = await this.favoriteService.removeFavorite(req.authenticatedUser!.id, dto);
      res.json(result);
    } catch (error) { next(error); }
  };

  getFavorites = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const favorites = await this.favoriteService.getFavorites(req.authenticatedUser!.id);
      res.json(favorites);
    } catch (error) { next(error); }
  };
}