import {
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
import { MenuService } from '../menu/menu.service';
import { CreatePlaceInput } from './dto/create-place';
import { UpdatePlaceInput } from './dto/update-place';
import { PlaceService } from './places.service';

@Controller('places')
export class PlaceController {
  constructor(
    private placeService: PlaceService,
    private menuService: MenuService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  userPlaces(@CurrentUser() user: UserPayload) {
    return this.placeService.findByUser(user.sub);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  createPlace(
    @CurrentUser() user: UserPayload,
    @Body() input: CreatePlaceInput,
  ) {
    return this.placeService.createPlace({
      userId: user.sub,
      ...input,
    });
  }

  @Get(':id')
  findPlace(@Param('id') id: string) {
    return this.placeService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updatePlace(
    @Param('id') id: string,
    @Body() input: UpdatePlaceInput,
    @CurrentUser() user: UserPayload,
  ) {
    await this.placeService.ownedByUser(id, user.sub);
    return await this.placeService.updateById(id, input);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deletePlace(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    await this.placeService.ownedByUser(id, user.sub);
    return await this.placeService.deleteById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/menus')
  async findPlaceMenus(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    await this.placeService.ownedByUser(id, user.sub);
    return await this.menuService.findAllByPlace(id);
  }
}
