import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { Menu, MenuDocument } from 'src/models/menu.schema';
import { Place, PlaceDocument } from 'src/models/place.schema';
import { CategoryService } from './category.service';
import { GroupService } from './group.service';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Place.name) private placeModel: Model<PlaceDocument>,
    @InjectModel(Menu.name) private menuModel: Model<MenuDocument>,
    private categoryService: CategoryService,
    private groupService: GroupService,
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
    // Create menu
    const [menu] = await this.menuModel.create(
      [
        {
          name: 'Default Menu',
          place: new Types.ObjectId(placeId),
        },
      ],
      { session },
    );

    // Create default category
    await this.categoryService.createDefaultCategory(menu._id, session);

    return menu;
  }

  async ownedByUser(
    menuId: string | Types.ObjectId,
    userId: string,
  ): Promise<MenuDocument> {
    // Look for matching document
    const found = await this.findById(menuId).populate('place');

    // If not found
    if (!found) throw new NotFoundException();

    // Get place
    const place = found.place as PlaceDocument;

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

  async deleteById(id: string | Types.ObjectId) {
    // Create session
    const session = await this.menuModel.startSession();

    // Wrap in transaction
    await session.withTransaction(async () => {
      // Delete groups
      await this.groupService.deleteAllByMenu(id, session);

      // Delete categories
      await this.categoryService.deleteAllByMenu(id, session);

      // Delete menu
      await this.menuModel.deleteOne(
        { _id: new Types.ObjectId(id) },
        { session },
      );
    });

    // End session
    await session.endSession();
  }

  async deleteAllByPlace(
    placeId: string | Types.ObjectId,
    session?: ClientSession,
  ) {
    // Get all menus
    const menus: MenuDocument[] = await this.findAllByPlace(placeId);

    // Get menuIds
    const menuIds: Types.ObjectId[] = menus.map((menu) => menu._id);

    // Delete Categories
    await Promise.all(
      menuIds.map((id) => this.categoryService.deleteAllByMenu(id, session)),
    );

    // Delete menus
    await this.menuModel.deleteMany(
      {
        _id: { $in: menuIds },
      },
      { session },
    );
  }

  async inUse(id: string | Types.ObjectId) {
    const place = await this.placeModel.findOne({
      menu: new Types.ObjectId(id),
    });
    return !!place;
  }
}
