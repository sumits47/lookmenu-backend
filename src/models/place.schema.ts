import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Menu } from './menu.schema';

@Schema()
export class Place {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: '#34cc95' })
  themeColor: string;

  @Prop({ required: true })
  currency: string;

  @Prop()
  phoneCode?: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  logoURL?: string;

  @Prop()
  bgURL?: string;

  @Prop()
  wifiName?: string;

  @Prop()
  wifiPassword?: string;

  @Prop()
  city?: string;

  @Prop()
  country?: string;

  @Prop()
  address?: string;

  @Prop({ required: true, default: true })
  canOrder: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Menu', required: true })
  menu: Types.ObjectId | Menu;
}

export type PlaceDocument = Place & Document;

export const PlaceSchema = SchemaFactory.createForClass(Place);
