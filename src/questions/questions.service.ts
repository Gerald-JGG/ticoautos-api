import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question, QuestionDocument } from './question.schema';
import { CreateQuestionDto } from './dto/create-question.dto';
import { VehiclesService } from '../vehicles/vehicles.service';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    private vehiclesService: VehiclesService,
  ) {}

  async create(
    vehicleId: string,
    createQuestionDto: CreateQuestionDto,
    userId: string,
  ): Promise<QuestionDocument> {
    await this.vehiclesService.findOne(vehicleId);

    const question = new this.questionModel({
      content: createQuestionDto.content,
      vehicle: new Types.ObjectId(vehicleId),
      askedBy: new Types.ObjectId(userId),
    });

    return (await question.save()).populate('askedBy', 'name email');
  }

  async findByVehicle(vehicleId: string): Promise<QuestionDocument[]> {
    if (!Types.ObjectId.isValid(vehicleId))
      throw new NotFoundException('Vehicle not found');

    return this.questionModel
      .find({ vehicle: new Types.ObjectId(vehicleId) })
      .populate('askedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  async findMyQuestions(userId: string): Promise<QuestionDocument[]> {
    return this.questionModel
      .find({ askedBy: new Types.ObjectId(userId) })
      .populate('vehicle', 'brand model year')
      .sort({ createdAt: -1 });
  }

  async findQuestionsForMyVehicles(userId: string): Promise<QuestionDocument[]> {
    const vehicles = await this.vehiclesService.findByOwner(userId);
    const vehicleIds = vehicles.map((v) => v._id);

    return this.questionModel
      .find({ vehicle: { $in: vehicleIds } })
      .populate('askedBy', 'name email')
      .populate('vehicle', 'brand model year')
      .sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<QuestionDocument> {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException('Question not found');

    const question = await this.questionModel
      .findById(id)
      .populate('askedBy', 'name email')
      .populate('vehicle', 'brand model year owner');

    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async verifyVehicleOwner(
    questionId: string,
    userId: string,
  ): Promise<QuestionDocument> {
    const question = await this.findOne(questionId);
    const vehicle = question.vehicle as any;

    if (vehicle.owner.toString() !== userId) {
      throw new ForbiddenException(
        'Only the vehicle owner can answer this question',
      );
    }

    return question;
  }
}