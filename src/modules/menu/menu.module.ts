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
import { Group, GroupSchema } from 'src/models/group.schema';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { Item, ItemSchema } from 'src/models/item.schema';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';

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
      {
        name: Group.name,
        schema: GroupSchema,
      },
      {
        name: Item.name,
        schema: ItemSchema,
      },
    ]),
  ],
  providers: [
    MenuService,
    PlaceService,
    CategoryService,
    GroupService,
    ItemService,
  ],
  controllers: [
    MenuController,
    CategoryController,
    GroupController,
    ItemController,
  ],
  exports: [MenuService],
})
export class MenuModule {}
