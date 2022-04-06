import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Place, PlaceDocument } from 'src/models/place.schema';
import { MenuService } from '../menu/menu.service';

@Injectable()
export class PlaceService {
  constructor(
    @InjectModel(Place.name) private placeModel: Model<PlaceDocument>,
    private menuService: MenuService,
  ) {}

  findByUser(userId: string) {
    return this.placeModel.find({ userId });
  }

  async createPlace(input: Partial<PlaceDocument>) {
    // Create session
    const session = await this.placeModel.startSession();

    // Create placeId & menuId
    const placeId = new Types.ObjectId();

    // Wrap in transaction
    await session.withTransaction(async () => {
      // Create menu
      const menu = await this.menuService.createDefaultMenu(placeId, session);

      // Set input attributes
      input._id = placeId;
      input.menu = menu._id;

      // Create place
      await this.placeModel.create([input], { session });
    });

    // End session
    await session.endSession();

    // Return created
    return await this.findById(placeId).populate('menu');
  }

  async ownedByUser(placeId: string, userId: string): Promise<PlaceDocument> {
    // Look for matching document
    const found = await this.findById(placeId);

    // If not found
    if (!found) throw new NotFoundException();

    // If place not owned by userId
    if (found.userId != userId) throw new ForbiddenException();

    // All good
    return found;
  }

  findById(id: string | Types.ObjectId) {
    return this.placeModel.findById(id);
  }

  updateById(id: string | Types.ObjectId, input: Partial<Place>) {
    return this.placeModel.findByIdAndUpdate(id, input, { new: true });
  }

  async deleteById(id: string | Types.ObjectId) {
    // Create session
    const session = await this.placeModel.startSession();

    // Wrap in transaction
    await session.withTransaction(async () => {
      // Delete menus
      await this.menuService.deleteAllByPlace(id, session);

      // Delete place
      await this.placeModel.deleteOne(
        { _id: new Types.ObjectId(id) },
        { session },
      );
    });

    // End session
    await session.endSession();
  }
}
