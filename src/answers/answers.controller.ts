import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../users/user.schema';

@Controller('questions')
export class AnswersController {
  constructor(private answersService: AnswersService) {}

  /**
   * POST /api/questions/:questionId/answer
   * Private - Answer a question (vehicle owner only)
   */
  @UseGuards(JwtAuthGuard)
  @Post(':questionId/answer')
  create(
    @Param('questionId') questionId: string,
    @Body() createAnswerDto: CreateAnswerDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.answersService.create(questionId, createAnswerDto, user._id.toString());
  }

  /**
   * GET /api/questions/:questionId/answer
   * Public - Get the answer for a specific question
   */
  @Get(':questionId/answer')
  findByQuestion(@Param('questionId') questionId: string) {
    return this.answersService.findByQuestion(questionId);
  }
}
