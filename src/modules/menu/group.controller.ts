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
import { CategoryService } from './category.service';
import { CreateGroupInput } from './dto/create-group';
import { UpdateGroupInput } from './dto/update-group';
import { GroupService } from './group.service';

@Controller('groups')
export class GroupController {
  constructor(
    private groupService: GroupService,
    private categoryService: CategoryService,
    @InjectConnection() private conn: Connection,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createGroup(
    @Body() input: CreateGroupInput,
    @CurrentUser() user: UserPayload,
  ) {
    // Category must be owned by user
    const category = await this.categoryService.ownedByUser(
      input.category,
      user.sub,
    );
    // Auto calculate position if not provided
    if (!input.position)
      input.position = await this.groupService.getNextPosition(category._id);
    const { name, position, bgURL } = input;
    return await this.groupService.createGroup({
      name,
      position,
      bgURL,
      category,
      menu: category.menu,
    });
  }

  @Get(':id')
  findGroup(@Param('id') id: string) {
    return this.groupService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateGroup(
    @Param('id') id: string,
    @Body() input: UpdateGroupInput,
    @CurrentUser() user: UserPayload,
  ) {
    // Group must be owned by user
    await this.groupService.ownedByUser(id, user.sub);
    return await this.groupService.updateById(id, input);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/up')
  async moveGroupUp(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    // Group must be owned by user
    const group = await this.groupService.ownedByUser(id, user.sub);
    // Get previous
    const prev = await this.groupService.getPrevious(id);
    // If no previous
    if (!prev) throw new BadRequestException();
    // Start session
    const session = await this.conn.startSession();
    // Wrap in transaction
    await session.withTransaction(async () => {
      const lower = prev.position;
      const higher = group.position;
      group.position = lower;
      prev.position = higher;
      await group.save();
      await prev.save();
    });
    // End session
    await session.endSession();
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/down')
  async moveGroupDown(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    // Group must be owned by user
    const group = await this.groupService.ownedByUser(id, user.sub);
    // Get next
    const next = await this.groupService.getNext(id);
    // If no next
    if (!next) throw new BadRequestException();
    // Start session
    const session = await this.conn.startSession();
    // Wrap in transaction
    await session.withTransaction(async () => {
      const lower = group.position;
      const higher = next.position;
      group.position = higher;
      next.position = lower;
      await group.save();
      await next.save();
    });
    // End session
    await session.endSession();
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteGroup(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    // Group must be owned by user
    await this.groupService.ownedByUser(id, user.sub);
    return await this.groupService.deleteById(id);
  }
}
