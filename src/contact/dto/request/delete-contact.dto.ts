import { ApiProperty } from '@nestjs/swagger';

export class DeleteContactDto {
  @ApiProperty({
    description:
      'send contact id or array of contact ids.depend on data type (array or number) of id will be removed.`optional` ',
    example: '[1, 2, 3] or 1',
  })
  id: number | number[];

  @ApiProperty({
    description:
      'send user id or array of user ids.depend on data type (array or number) of id will be removed.`optional` ',
    example: '[1, 2, 3] or 1',
  })
  userId: number | number[];
}
