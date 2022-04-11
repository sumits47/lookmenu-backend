import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/libs/decorators';
import { UserPayload } from 'src/types/auth0';
import { CreateItemInput } from './dto/create-item';
import { UpdateItemInput } from './dto/update-item';
import { GroupService } from './group.service';
import { ItemService } from './item.service';

@Controller('items')
export class ItemController {
  constructor(
    private groupService: GroupService,
    private itemService: ItemService,
    @InjectConnection() private conn: Connection,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createItem(
    @Body() input: CreateItemInput,
    @CurrentUser() user: UserPayload,
  ) {
    // Group must be owned by user
    const group = await this.groupService.ownedByUser(input.group, user.sub);
    // Auto calculate position if not provided
    if (!input.position)
      input.position = await this.itemService.getNextPosition(group._id);
    const {
      name,
      position,
      description,
      oldPrice,
      price,
      weight,
      imageURL,
      visible,
      available,
    } = input;
    return await this.itemService.createItem({
      name,
      position,
      description,
      oldPrice,
      price,
      weight,
      imageURL,
      visible,
      available,
      group,
      category: group.category,
      menu: group.menu,
    });
  }

  @Get(':id')
  findItem(@Param('id') id: string) {
    return this.itemService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateItem(
    @Param('id') id: string,
    @Body() input: UpdateItemInput,
    @CurrentUser() user: UserPayload,
  ) {
    // Item must be owned by user
    await this.itemService.ownedByUser(id, user.sub);
    return await this.itemService.updateById(id, input);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/up')
  async moveItemUp(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    // Item must be owned by user
    const item = await this.itemService.ownedByUser(id, user.sub);
    // Get previous
    const prev = await this.itemService.getPrevious(id);
    // If no previous
    if (!prev) throw new BadRequestException();
    // Start session
    const session = await this.conn.startSession();
    // Wrap in transaction
    await session.withTransaction(async () => {
      const lower = prev.position;
      const higher = item.position;
      item.position = lower;
      prev.position = higher;
      await item.save();
      await prev.save();
    });
    // End session
    await session.endSession();
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/down')
  async moveItemDown(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    // Item must be owned by user
    const item = await this.itemService.ownedByUser(id, user.sub);
    // Get next
    const next = await this.itemService.getNext(id);
    // If no next
    if (!next) throw new BadRequestException();
    // Start session
    const session = await this.conn.startSession();
    // Wrap in transaction
    await session.withTransaction(async () => {
      const lower = item.position;
      const higher = next.position;
      item.position = higher;
      next.position = lower;
      await item.save();
      await next.save();
    });
    // End session
    await session.endSession();
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteItem(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    // Item must be owned by user
    await this.itemService.ownedByUser(id, user.sub);
    return await this.itemService.deleteById(id);
  }
}
