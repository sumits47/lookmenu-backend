import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { Group, GroupDocument } from 'src/models/group.schema';
import { MenuDocument } from 'src/models/menu.schema';
import { PlaceDocument } from 'src/models/place.schema';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  findAllByCategory(categoryId: string | Types.ObjectId) {
    return this.groupModel.find(
      { category: new Types.ObjectId(categoryId) },
      undefined,
      { sort: { position: 1 } },
    );
  }

  createGroup(input: Partial<GroupDocument>) {
    return this.groupModel.create(input);
  }

  async createDefaultGroup(
    menuId: string | Types.ObjectId,
    categoryId: string | Types.ObjectId,
    session?: ClientSession,
  ) {
    const [group] = await this.groupModel.create(
      [
        {
          name: 'Appetizers',
          menu: new Types.ObjectId(menuId),
          category: new Types.ObjectId(categoryId),
          bgURL: 'https://lookmenu.sgp1.digitaloceanspaces.com/appetizer.jpeg',
        },
      ],
      { session },
    );
    return group;
  }

  async ownedByUser(groupId: string, userId: string): Promise<GroupDocument> {
    // Look for matching document
    const found = await this.groupModel.findById(groupId).populate('menu');

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
    return this.groupModel.findById(id);
  }

  updateById(
    id: string | Types.ObjectId,
    input: Partial<Group>,
    session?: ClientSession,
  ) {
    return this.groupModel.findByIdAndUpdate(id, input, {
      new: true,
      session,
    });
  }

  deleteById(id: string | Types.ObjectId) {
    return this.groupModel.findByIdAndDelete(id);
  }

  deleteAllByMenu(menuId: string | Types.ObjectId, session?: ClientSession) {
    return this.groupModel.deleteMany(
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
    return this.groupModel.deleteMany(
      {
        category: new Types.ObjectId(categoryId),
      },
      { session },
    );
  }

  async getNextPosition(categoryId: string | Types.ObjectId) {
    const group = await this.groupModel.findOne(
      { category: new Types.ObjectId(categoryId) },
      undefined,
      { sort: { position: -1 } },
    );
    if (!group) return 0;
    else return group.position + 1;
  }

  async getNext(
    id: string | Types.ObjectId,
  ): Promise<GroupDocument | undefined> {
    // Get group
    const group = await this.findById(id);

    // Get category's next
    const next = await this.groupModel.findOne(
      {
        category: group.category,
        position: {
          $gt: group.position,
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
  ): Promise<GroupDocument | undefined> {
    // Get group
    const group = await this.findById(id);

    // Get category's previous
    const prev = await this.groupModel.findOne(
      {
        category: group.category,
        position: {
          $lt: group.position,
        },
      },
      undefined,
      { sort: { position: -1 } },
    );

    // All Good
    return prev;
  }
}
