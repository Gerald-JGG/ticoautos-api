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

  async findByVehicle(vehicleId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(vehicleId))
      throw new NotFoundException('Vehicle not found');

    return this.questionModel.aggregate([
      {
        $match: { vehicle: new Types.ObjectId(vehicleId) },
      },
      // Join answers
      {
        $lookup: {
          from: 'answers',
          localField: '_id',
          foreignField: 'question',
          as: 'answerArr',
        },
      },
      {
        $addFields: {
          answer: { $arrayElemAt: ['$answerArr', 0] },
        },
      },
      // Populate askedBy user
      {
        $lookup: {
          from: 'users',
          localField: 'askedBy',
          foreignField: '_id',
          as: 'askedByArr',
        },
      },
      {
        $addFields: {
          askedBy: { $arrayElemAt: ['$askedByArr', 0] },
        },
      },
      // Populate answeredBy user inside answer
      {
        $lookup: {
          from: 'users',
          localField: 'answer.answeredBy',
          foreignField: '_id',
          as: 'answeredByArr',
        },
      },
      {
        $addFields: {
          'answer.answeredBy': { $arrayElemAt: ['$answeredByArr', 0] },
        },
      },
      // Project only needed fields
      {
        $project: {
          content: 1,
          vehicle: 1,
          createdAt: 1,
          'askedBy._id': 1,
          'askedBy.name': 1,
          'askedBy.email': 1,
          answer: {
            $cond: {
              if: { $gt: [{ $size: '$answerArr' }, 0] },
              then: {
                _id: '$answer._id',
                content: '$answer.content',
                createdAt: '$answer.createdAt',
                answeredBy: {
                  _id: '$answer.answeredBy._id',
                  name: '$answer.answeredBy.name',
                  email: '$answer.answeredBy.email',
                },
              },
              else: '$$REMOVE',
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
  }

  async findMyQuestions(userId: string): Promise<QuestionDocument[]> {
    return this.questionModel
      .find({ askedBy: new Types.ObjectId(userId) })
      .populate('vehicle', 'brand model year')
      .sort({ createdAt: -1 });
  }

  async findQuestionsForMyVehicles(userId: string): Promise<any[]> {
    const vehicles = await this.vehiclesService.findByOwner(userId);
    const vehicleIds = vehicles.map((v) => v._id);

    return this.questionModel.aggregate([
      {
        $match: { vehicle: { $in: vehicleIds } },
      },
      // Join answers
      {
        $lookup: {
          from: 'answers',
          localField: '_id',
          foreignField: 'question',
          as: 'answerArr',
        },
      },
      {
        $addFields: {
          answer: { $arrayElemAt: ['$answerArr', 0] },
        },
      },
      // Populate askedBy user
      {
        $lookup: {
          from: 'users',
          localField: 'askedBy',
          foreignField: '_id',
          as: 'askedByArr',
        },
      },
      {
        $addFields: {
          askedBy: { $arrayElemAt: ['$askedByArr', 0] },
        },
      },
      // Populate vehicle
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicle',
          foreignField: '_id',
          as: 'vehicleArr',
        },
      },
      {
        $addFields: {
          vehicle: { $arrayElemAt: ['$vehicleArr', 0] },
        },
      },
      {
        $project: {
          content: 1,
          createdAt: 1,
          'askedBy._id': 1,
          'askedBy.name': 1,
          'askedBy.email': 1,
          'vehicle._id': 1,
          'vehicle.brand': 1,
          'vehicle.model': 1,
          'vehicle.year': 1,
          answer: {
            $cond: {
              if: { $gt: [{ $size: '$answerArr' }, 0] },
              then: {
                _id: '$answer._id',
                content: '$answer.content',
                createdAt: '$answer.createdAt',
              },
              else: '$$REMOVE',
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
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