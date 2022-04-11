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
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/libs/decorators';
import { UserPayload } from 'src/types/auth0';
import { PlaceService } from '../place/places.service';
import { CategoryService } from './category.service';
import { CreateMenuInput } from './dto/create-menu';
import { UpdateMenuInput } from './dto/update-menu';
import { ItemService } from './item.service';
import { MenuService } from './menu.service';

@Controller('menus')
export class MenuController {
  constructor(
    private placeService: PlaceService,
    private menuService: MenuService,
    private categoryService: CategoryService,
    private itemService: ItemService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createMenu(
    @Body() input: CreateMenuInput,
    @CurrentUser() user: UserPayload,
  ) {
    // Place must be owned by user
    const place = await this.placeService.ownedByUser(input.place, user.sub);
    const { name, description } = input;
    return await this.menuService.createMenu({
      name,
      description,
      place,
    });
  }

  @Get(':id')
  findMenu(@Param('id') id: string) {
    return this.menuService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateMenu(
    @Param('id') id: string,
    @Body() input: UpdateMenuInput,
    @CurrentUser() user: UserPayload,
  ) {
    // Menu must be owned by user
    await this.menuService.ownedByUser(id, user.sub);
    return await this.menuService.updateById(id, input);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteMenu(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    // Menu must be owned by user
    await this.menuService.ownedByUser(id, user.sub);
    // Is menu in use by any place?
    if (await this.menuService.inUse(id)) throw new BadRequestException();
    return await this.menuService.deleteById(id);
  }

  @Get(':id/categories')
  menuCategories(@Param('id') id: string) {
    return this.categoryService.findAllByMenu(id);
  }

  @Get(':id/items')
  menuItems(@Param('id') id: string) {
    return this.itemService.findAllByMenu(id);
  }
}
