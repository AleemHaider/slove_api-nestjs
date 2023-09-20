import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { SINGLE_FILE_UPLOAD_TYPE } from '../../../util/constant';

export class SingleFileUploadDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  file: any;

  @ApiProperty()
  @IsEnum(SINGLE_FILE_UPLOAD_TYPE)
  @IsNotEmpty()
  type: SINGLE_FILE_UPLOAD_TYPE;
}
