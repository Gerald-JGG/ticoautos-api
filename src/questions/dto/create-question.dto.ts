import { IsString, MinLength } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @MinLength(5, { message: 'Question must be at least 5 characters' })
  content: string;
}
