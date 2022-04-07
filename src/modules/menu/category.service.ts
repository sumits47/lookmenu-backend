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

@Injectable()
export class CategoryService {
  constructor(
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
    const [category] = await this.categoryModel.create(
      [
        {
          name: 'Food',
          menu: new Types.ObjectId(menuId),
        },
      ],
      { session },
    );
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

  deleteById(id: string | Types.ObjectId) {
    return this.categoryModel.findByIdAndDelete(id);
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

  async isFirst(id: string | Types.ObjectId): Promise<boolean> {
    // Get category
    const category = await this.findById(id);

    // If not found
    if (!category) throw new NotFoundException();

    // Get menu's first
    const first = await this.categoryModel.findOne(
      {
        menu: category.menu,
      },
      undefined,
      { sort: { position: 1 } },
    );

    // Is first same as this category
    return category._id.equals(first._id);
  }

  async isLast(id: string | Types.ObjectId): Promise<boolean> {
    // Get category
    const category = await this.findById(id);

    // If not found
    if (!category) throw new NotFoundException();

    // Get menu's last
    const last = await this.categoryModel.findOne(
      {
        menu: category.menu,
      },
      undefined,
      { sort: { position: -1 } },
    );

    // Is last same as this category
    return category._id.equals(last._id);
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
