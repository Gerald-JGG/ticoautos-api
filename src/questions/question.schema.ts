import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicle: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  askedBy: Types.ObjectId;

  // createdAt is automatically added by timestamps: true
  // It represents the "fecha de pregunta" required by the project
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
