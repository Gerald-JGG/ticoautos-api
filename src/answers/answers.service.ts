import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Answer, AnswerDocument } from './answer.schema';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { QuestionsService } from '../questions/questions.service';

@Injectable()
export class AnswersService {
  constructor(
    @InjectModel(Answer.name) private answerModel: Model<AnswerDocument>,
    private questionsService: QuestionsService,
  ) {}

  /**
   * Answer a question (vehicle owner only)
   * One question can only have one answer
   */
  async create(
    questionId: string,
    createAnswerDto: CreateAnswerDto,
    userId: string,
  ): Promise<AnswerDocument> {
    // Verify user is the vehicle owner
    await this.questionsService.verifyVehicleOwner(questionId, userId);

    // Check if question already has an answer
    const existing = await this.answerModel.findOne({
      question: new Types.ObjectId(questionId),
    });
    if (existing) {
      throw new ConflictException('This question already has an answer');
    }

    const answer = new this.answerModel({
      content: createAnswerDto.content,
      question: new Types.ObjectId(questionId),
      answeredBy: new Types.ObjectId(userId),
    });

    return (await answer.save()).populate('answeredBy', 'name email');
  }

  /**
   * Get answer for a specific question
   */
  async findByQuestion(questionId: string): Promise<AnswerDocument | null> {
    return this.answerModel
      .findOne({ question: new Types.ObjectId(questionId) })
      .populate('answeredBy', 'name email');
  }
}
