import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/libs/decorators';
import { UserPayload } from 'src/types/auth0';
import { CreatePlaceInput } from './dto/create-place';
import { UpdatePlaceInput } from './dto/update-place';
import { PlacesService } from './places.service';

@Controller('places')
export class PlacesController {
  constructor(private placeService: PlacesService) {}

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

  @Patch(':id')
  updatePlace(@Param('id') id: string, @Body() input: UpdatePlaceInput) {
    return this.placeService.updateById(id, input);
  }
}
