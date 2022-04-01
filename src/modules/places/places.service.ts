import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Place, PlaceDocument } from 'src/models/place.schema';

@Injectable()
export class PlacesService {
  constructor(
    @InjectModel(Place.name) private placeModel: Model<PlaceDocument>,
  ) {}

  findByUser(userId: string) {
    return this.placeModel.find({ userId });
  }

  createPlace(input: Partial<Place>) {
    return this.placeModel.create(input);
  }

  findById(id: string) {
    return this.placeModel.findById(id);
  }

  updateById(id: string, input: Partial<Place>) {
    return this.placeModel.findByIdAndUpdate(id, input, { new: true });
  }
}
