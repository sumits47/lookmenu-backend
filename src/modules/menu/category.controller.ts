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
import { CreateCategoryInput } from './dto/create-category';
import { UpdateCategoryInput } from './dto/update-category';
import { MenuService } from './menu.service';
import { GroupService } from './group.service';

@Controller('categories')
export class CategoryController {
  constructor(
    private menuService: MenuService,
    private categoryService: CategoryService,
    private groupService: GroupService,
    @InjectConnection() private conn: Connection,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createCategory(
    @Body() input: CreateCategoryInput,
    @CurrentUser() user: UserPayload,
  ) {
    // Menu must be owned by user
    const menu = await this.menuService.ownedByUser(input.menu, user.sub);
    // Auto calculate position if not provided
    if (!input.position)
      input.position = await this.categoryService.getNextPosition(menu._id);
    const { name, position } = input;
    return await this.categoryService.createCategory({
      name,
      position,
      menu,
    });
  }

  @Get(':id')
  findCategory(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() input: UpdateCategoryInput,
    @CurrentUser() user: UserPayload,
  ) {
    // Category must be owned by user
    await this.categoryService.ownedByUser(id, user.sub);
    return await this.categoryService.updateById(id, input);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/up')
  async moveCategoryUp(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    // Category must be owned by user
    const category = await this.categoryService.ownedByUser(id, user.sub);
    // Get previous
    const prev = await this.categoryService.getPrevious(id);
    // If no previous
    if (!prev) throw new BadRequestException();
    // Start session
    const session = await this.conn.startSession();
    // Wrap in transaction
    await session.withTransaction(async () => {
      const lower = prev.position;
      const higher = category.position;
      category.position = lower;
      prev.position = higher;
      await category.save();
      await prev.save();
    });
    // End session
    await session.endSession();
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/down')
  async moveCategoryDown(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    // Category must be owned by user
    const category = await this.categoryService.ownedByUser(id, user.sub);
    // Get next
    const next = await this.categoryService.getNext(id);
    // If no next
    if (!next) throw new BadRequestException();
    // Start session
    const session = await this.conn.startSession();
    // Wrap in transaction
    await session.withTransaction(async () => {
      const lower = category.position;
      const higher = next.position;
      category.position = higher;
      next.position = lower;
      await category.save();
      await next.save();
    });
    // End session
    await session.endSession();
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteCategory(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    // Category must be owned by user
    await this.categoryService.ownedByUser(id, user.sub);
    return await this.categoryService.deleteById(id);
  }

  @Get(':id/groups')
  categoryGroups(@Param('id') id: string) {
    return this.groupService.findAllByCategory(id);
  }
}
