import { ApiProperty, PartialType } from '@nestjs/swagger';
import { AddAnswersDto } from './add-answers.dto';

export class UpdateAnswersDto extends PartialType(AddAnswersDto) {
  @ApiProperty()
  bio: string;
}
