import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { Menu } from './menu.schema';
import { Category } from './category.schema';

@Schema({ collection: 'category_groups' })
export class Group {
  @Prop({ type: Types.ObjectId, ref: 'Menu', required: true, index: true })
  menu: Types.ObjectId | Menu;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  category: Types.ObjectId | Category;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 0 })
  position: number;

  @Prop()
  bgURL?: string;
}

export type GroupDocument = Group & Document;

export const GroupSchema = SchemaFactory.createForClass(Group);
