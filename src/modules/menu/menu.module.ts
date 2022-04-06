import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Menu, MenuSchema } from 'src/models/menu.schema';
import { Place, PlaceSchema } from 'src/models/place.schema';
import { PlaceService } from '../place/places.service';

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
    ]),
  ],
  providers: [MenuService, PlaceService],
  controllers: [MenuController],
  exports: [MenuService],
})
export class MenuModule {}
