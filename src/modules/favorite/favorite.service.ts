import { Repository } from 'typeorm';
import { AddFavoriteDto, RemoveFavoriteDto } from '../../dtos/favorite.dto';
import { Favorite } from '../../entities/favorite.entity';
import { ConflictException, NotFoundException } from '../../exceptions/HttpExceptions';

type FavoritesStructure = {
  blogs: string[];
  users: string[];
  layouts: string[];
};

export class FavoriteService {
  constructor(private favoriteRepo: Repository<Favorite>) {}

  private async getOrCreateFavorites(userId: string): Promise<Favorite & { favorites: FavoritesStructure }> {
    let fav = await this.favoriteRepo.findOne({ where: { user_id: userId } });
    if (!fav) {
      fav = this.favoriteRepo.create({
        user_id: userId,
        favorites: { blogs: [], users: [], layouts: [] },
      });
      await this.favoriteRepo.save(fav);
    }
    // Ensure favorites exists and has all required arrays
    if (!fav.favorites) {
      fav.favorites = { blogs: [], users: [], layouts: [] };
    } else {
      if (!fav.favorites.blogs) fav.favorites.blogs = [];
      if (!fav.favorites.users) fav.favorites.users = [];
      if (!fav.favorites.layouts) fav.favorites.layouts = [];
    }
    return fav as Favorite & { favorites: FavoritesStructure };
  }

  async addFavorite(userId: string, dto: AddFavoriteDto): Promise<Favorite> {
    const fav = await this.getOrCreateFavorites(userId);
    const list = fav.favorites[`${dto.type}s` as keyof FavoritesStructure];
    if (list.includes(dto.itemId)) throw new ConflictException('Already in favorites');
    list.push(dto.itemId);
    await this.favoriteRepo.save(fav);
    return fav;
  }

  async removeFavorite(userId: string, dto: RemoveFavoriteDto): Promise<Favorite> {
    const fav = await this.getOrCreateFavorites(userId);
    const list = fav.favorites[`${dto.type}s` as keyof FavoritesStructure];
    const index = list.indexOf(dto.itemId);
    if (index === -1) throw new NotFoundException('Favorite not found');
    list.splice(index, 1);
    await this.favoriteRepo.save(fav);
    return fav;
  }

  async getFavorites(userId: string): Promise<FavoritesStructure> {
    const fav = await this.favoriteRepo.findOne({ where: { user_id: userId } });
    if (!fav || !fav.favorites) {
      return { blogs: [], users: [], layouts: [] };
    }
    return {
      blogs: fav.favorites.blogs ?? [],
      users: fav.favorites.users ?? [],
      layouts: fav.favorites.layouts ?? [],
    };
  }
}