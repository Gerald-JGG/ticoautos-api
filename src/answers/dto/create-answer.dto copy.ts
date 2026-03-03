import { IsString, MinLength } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  @MinLength(2, { message: 'Answer must be at least 2 characters' })
  content: string;
}
