import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MULTIPLE_FILE_UPLOAD_TYPE } from '../../../util/constant';

export class MultipleFileUploadDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(MULTIPLE_FILE_UPLOAD_TYPE)
  type: MULTIPLE_FILE_UPLOAD_TYPE;
}
