import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Menu, MenuSchema } from 'src/models/menu.schema';
import { Place, PlaceSchema } from 'src/models/place.schema';
import { MenuModule } from '../menu/menu.module';
import { PlaceController } from './places.controller';
import { PlaceService } from './places.service';

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
    MenuModule,
  ],
  controllers: [PlaceController],
  providers: [PlaceService],
})
export class PlaceModule {}
