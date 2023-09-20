import { PartialType } from '@nestjs/swagger';
import { CreateFeedbackDto } from './request/create-feedback.dto';

export class UpdateFeedbackDto extends PartialType(CreateFeedbackDto) {}
