import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { Category, CategoryDocument } from 'src/models/category.schema';
import { MenuDocument } from 'src/models/menu.schema';
import { PlaceDocument } from 'src/models/place.schema';
import { GroupService } from './group.service';

@Injectable()
export class CategoryService {
  constructor(
    private groupService: GroupService,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  findAllByMenu(menuId: string | Types.ObjectId) {
    return this.categoryModel.find(
      { menu: new Types.ObjectId(menuId) },
      undefined,
      { sort: { position: 1 } },
    );
  }

  createCategory(input: Partial<CategoryDocument>) {
    return this.categoryModel.create(input);
  }

  async createDefaultCategory(
    menuId: string | Types.ObjectId,
    session?: ClientSession,
  ) {
    // Create category
    const [category] = await this.categoryModel.create(
      [
        {
          name: 'Food',
          menu: new Types.ObjectId(menuId),
        },
      ],
      { session },
    );

    // Create group
    await this.groupService.createDefaultGroup(menuId, category._id, session);

    return category;
  }

  async ownedByUser(
    categoryId: string,
    userId: string,
  ): Promise<CategoryDocument> {
    // Look for matching document
    const found = await this.categoryModel
      .findById(categoryId)
      .populate('menu');

    // If not found
    if (!found) throw new NotFoundException();

    // Get menu
    const menu = found.menu as MenuDocument;

    // Get place
    await menu.populate('place');
    const place = menu.place as PlaceDocument;

    // If place not owned by userId
    if (place.userId != userId) throw new ForbiddenException();

    // All good
    return found;
  }

  findById(id: string | Types.ObjectId) {
    return this.categoryModel.findById(id);
  }

  updateById(
    id: string | Types.ObjectId,
    input: Partial<Category>,
    session?: ClientSession,
  ) {
    return this.categoryModel.findByIdAndUpdate(id, input, {
      new: true,
      session,
    });
  }

  async deleteById(id: string | Types.ObjectId) {
    // Create session
    const session = await this.categoryModel.startSession();

    // Wrap in transaction
    await session.withTransaction(async () => {
      // Delete groups
      await this.groupService.deleteAllByCategory(id, session);

      // Delete category
      await this.categoryModel.deleteOne(
        { _id: new Types.ObjectId(id) },
        { session },
      );
    });

    // End session
    await session.endSession();
  }

  deleteAllByMenu(menuId: string | Types.ObjectId, session?: ClientSession) {
    return this.categoryModel.deleteMany(
      {
        menu: new Types.ObjectId(menuId),
      },
      { session },
    );
  }

  async getNextPosition(menuId: string | Types.ObjectId) {
    const category = await this.categoryModel.findOne(
      { menu: new Types.ObjectId(menuId) },
      undefined,
      { sort: { position: -1 } },
    );
    if (!category) return 0;
    else return category.position + 1;
  }

  async getNext(
    id: string | Types.ObjectId,
  ): Promise<CategoryDocument | undefined> {
    // Get category
    const category = await this.findById(id);

    // Get menu's next
    const next = await this.categoryModel.findOne(
      {
        menu: category.menu,
        position: {
          $gt: category.position,
        },
      },
      undefined,
      { sort: { position: 1 } },
    );

    // All Good
    return next;
  }

  async getPrevious(
    id: string | Types.ObjectId,
  ): Promise<CategoryDocument | undefined> {
    // Get category
    const category = await this.findById(id);

    // Get menu's previous
    const prev = await this.categoryModel.findOne(
      {
        menu: category.menu,
        position: {
          $lt: category.position,
        },
      },
      undefined,
      { sort: { position: -1 } },
    );

    // All Good
    return prev;
  }
}
