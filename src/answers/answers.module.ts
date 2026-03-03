import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnswersController } from './answers.controller';
import { AnswersService } from '../../../ticonautos-api/src/answers/answers.service';
import { Answer, AnswerSchema } from './answer.schema';
import { QuestionsModule } from '../../../ticonautos-api/src/questions/questions.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Answer.name, schema: AnswerSchema }]),
    QuestionsModule,
  ],
  controllers: [AnswersController],
  providers: [AnswersService],
})
export class AnswersModule {}
