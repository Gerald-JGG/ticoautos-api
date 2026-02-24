import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnswerDocument = Answer & Document;

@Schema({ timestamps: true })
export class Answer {
  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Question', required: true, unique: true })
  question: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  answeredBy: Types.ObjectId;

  // createdAt from timestamps = "fecha de respuesta"
  // answeredBy = "usuario que responde"
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
