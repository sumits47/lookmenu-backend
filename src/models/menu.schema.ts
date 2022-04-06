import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Place } from './place.schema';

@Schema({ collection: 'menus' })
export class Menu {
  @Prop({ type: Types.ObjectId, ref: 'Place', required: true, index: true })
  place: Types.ObjectId | Place;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;
}

export type MenuDocument = Menu & Document;

export const MenuSchema = SchemaFactory.createForClass(Menu);
