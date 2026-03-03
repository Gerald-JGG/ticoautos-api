import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/user.schema';

@Controller()
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  /**
   * POST /api/vehicles/:vehicleId/questions
   * Private - Ask a question about a vehicle
   */
  @UseGuards(JwtAuthGuard)
  @Post('vehicles/:vehicleId/questions')
  create(
    @Param('vehicleId') vehicleId: string,
    @Body() createQuestionDto: CreateQuestionDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.questionsService.create(vehicleId, createQuestionDto, user._id.toString());
  }

  /**
   * GET /api/vehicles/:vehicleId/questions
   * Public - View all questions for a vehicle (with answers)
   */
  @Get('vehicles/:vehicleId/questions')
  findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.questionsService.findByVehicle(vehicleId);
  }

  /**
   * GET /api/questions/my
   * Private - Get questions the authenticated user has asked
   */
  @UseGuards(JwtAuthGuard)
  @Get('questions/my')
  findMyQuestions(@CurrentUser() user: UserDocument) {
    return this.questionsService.findMyQuestions(user._id.toString());
  }

  /**
   * GET /api/questions/inbox
   * Private - Get all questions for the authenticated user's vehicles (owner inbox)
   */
  @UseGuards(JwtAuthGuard)
  @Get('questions/inbox')
  getInbox(@CurrentUser() user: UserDocument) {
    return this.questionsService.findQuestionsForMyVehicles(user._id.toString());
  }
}
