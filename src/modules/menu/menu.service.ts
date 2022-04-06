import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { Menu, MenuDocument } from 'src/models/menu.schema';
import { Place, PlaceDocument } from 'src/models/place.schema';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Place.name) private placeModel: Model<PlaceDocument>,
    @InjectModel(Menu.name) private menuModel: Model<MenuDocument>,
  ) {}

  findAllByPlace(placeId: string | Types.ObjectId) {
    return this.menuModel.find({ place: new Types.ObjectId(placeId) });
  }

  createMenu(input: Partial<MenuDocument>) {
    return this.menuModel.create(input);
  }

  async createDefaultMenu(
    placeId: string | Types.ObjectId,
    session?: ClientSession,
  ): Promise<MenuDocument> {
    const [menu] = await this.menuModel.create(
      [
        {
          name: 'Default Menu',
          place: new Types.ObjectId(placeId),
        },
      ],
      { session },
    );
    return menu;
  }

  async ownedByUser(menuId: string, userId: string): Promise<MenuDocument> {
    // Look for matching document
    const found = await this.findById(menuId).populate('place');

    // If not found
    if (!found) throw new NotFoundException();

    // Get place
    const place = found.place as Place;

    // If place not owned by userId
    if (place.userId != userId) throw new ForbiddenException();

    // All good
    return found;
  }

  findById(id: string | Types.ObjectId) {
    return this.menuModel.findById(id);
  }

  updateById(id: string | Types.ObjectId, input: Partial<Menu>) {
    return this.menuModel.findByIdAndUpdate(id, input, { new: true });
  }

  deleteById(id: string | Types.ObjectId) {
    return this.menuModel.findByIdAndDelete(id);
  }

  deleteAllByPlace(placeId: string | Types.ObjectId, session?: ClientSession) {
    return this.menuModel.deleteMany(
      {
        place: new Types.ObjectId(placeId),
      },
      { session },
    );
  }
}
