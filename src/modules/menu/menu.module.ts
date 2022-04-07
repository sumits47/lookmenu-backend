import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Menu, MenuSchema } from 'src/models/menu.schema';
import { Place, PlaceSchema } from 'src/models/place.schema';
import { PlaceService } from '../place/places.service';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category, CategorySchema } from 'src/models/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Place.name,
        schema: PlaceSchema,
      },
      {
        name: Menu.name,
        schema: MenuSchema,
      },
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),
  ],
  providers: [MenuService, PlaceService, CategoryService],
  controllers: [MenuController, CategoryController],
  exports: [MenuService],
})
export class MenuModule {}
