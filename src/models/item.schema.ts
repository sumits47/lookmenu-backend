import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { Menu } from './menu.schema';
import { Category } from './category.schema';
import { Group } from './group.schema';

@Schema({ collection: 'group_items' })
export class Item {
  @Prop({ type: Types.ObjectId, ref: 'Menu', required: true, index: true })
  menu: Types.ObjectId | Menu;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  category: Types.ObjectId | Category;

  @Prop({ type: Types.ObjectId, ref: 'Group', required: true, index: true })
  group: Types.ObjectId | Group;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 0 })
  position: number;

  @Prop()
  description?: string;

  @Prop()
  oldPrice?: number;

  @Prop({ required: true, default: 0 })
  price: number;

  @Prop()
  weight: string;

  @Prop()
  imageURL?: string;

  @Prop({ required: true, default: true })
  visible: boolean;

  @Prop({ required: true, default: true })
  available: boolean;
}

export type ItemDocument = Item & Document;

export const ItemSchema = SchemaFactory.createForClass(Item);
