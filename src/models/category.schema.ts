import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { Menu } from './menu.schema';

@Schema({ collection: 'menu_categories' })
export class Category {
  @Prop({ type: Types.ObjectId, ref: 'Menu', required: true, index: true })
  menu: Types.ObjectId | Menu;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 0 })
  position: number;
}

export type CategoryDocument = Category & Document;

export const CategorySchema = SchemaFactory.createForClass(Category);
