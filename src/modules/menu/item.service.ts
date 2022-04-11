import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { Item, ItemDocument } from 'src/models/item.schema';
import { MenuDocument } from 'src/models/menu.schema';
import { PlaceDocument } from 'src/models/place.schema';

@Injectable()
export class ItemService {
  constructor(@InjectModel(Item.name) private itemModel: Model<ItemDocument>) {}

  findAllByMenu(menuId: string | Types.ObjectId) {
    return this.itemModel.find(
      { menu: new Types.ObjectId(menuId) },
      undefined,
      {
        sort: {
          category: 1,
          group: 1,
          position: 1,
        },
      },
    );
  }

  findAllByGroup(groupId: string | Types.ObjectId) {
    return this.itemModel.find(
      { group: new Types.ObjectId(groupId) },
      undefined,
      { sort: { position: 1 } },
    );
  }

  createItem(input: Partial<ItemDocument>) {
    return this.itemModel.create(input);
  }

  async createDefaultItem(
    menuId: string | Types.ObjectId,
    categoryId: string | Types.ObjectId,
    groupId: string | Types.ObjectId,
    session?: ClientSession,
  ) {
    const [item] = await this.itemModel.create(
      [
        {
          name: 'Breadsticks',
          menu: new Types.ObjectId(menuId),
          category: new Types.ObjectId(categoryId),
          group: new Types.ObjectId(groupId),
          price: 10,
        },
      ],
      { session },
    );
    return item;
  }

  async ownedByUser(itemId: string, userId: string): Promise<ItemDocument> {
    // Look for matching document
    const found = await this.findById(itemId).populate('menu');

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
    return this.itemModel.findById(id);
  }

  updateById(
    id: string | Types.ObjectId,
    input: Partial<Item>,
    session?: ClientSession,
  ) {
    return this.itemModel.findByIdAndUpdate(id, input, {
      new: true,
      session,
    });
  }

  deleteById(id: string | Types.ObjectId) {
    return this.itemModel.findByIdAndDelete(id);
  }

  deleteAllByMenu(menuId: string | Types.ObjectId, session?: ClientSession) {
    return this.itemModel.deleteMany(
      {
        menu: new Types.ObjectId(menuId),
      },
      { session },
    );
  }

  deleteAllByCategory(
    categoryId: string | Types.ObjectId,
    session?: ClientSession,
  ) {
    return this.itemModel.deleteMany(
      {
        category: new Types.ObjectId(categoryId),
      },
      { session },
    );
  }

  deleteAllByGroup(groupId: string | Types.ObjectId, session?: ClientSession) {
    return this.itemModel.deleteMany(
      {
        group: new Types.ObjectId(groupId),
      },
      { session },
    );
  }

  async getNextPosition(groupId: string | Types.ObjectId) {
    const item = await this.itemModel.findOne(
      { group: new Types.ObjectId(groupId) },
      undefined,
      { sort: { position: -1 } },
    );
    if (!item) return 0;
    else return item.position + 1;
  }

  async getNext(
    id: string | Types.ObjectId,
  ): Promise<ItemDocument | undefined> {
    // Get item
    const item = await this.findById(id);

    // Get group's next
    const next = await this.itemModel.findOne(
      {
        group: item.group,
        position: {
          $gt: item.position,
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
  ): Promise<ItemDocument | undefined> {
    // Get item
    const item = await this.findById(id);

    // Get group's previous
    const prev = await this.itemModel.findOne(
      {
        group: item.group,
        position: {
          $lt: item.position,
        },
      },
      undefined,
      { sort: { position: -1 } },
    );

    // All Good
    return prev;
  }
}
