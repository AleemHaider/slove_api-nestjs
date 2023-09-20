import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { StandardResponse } from '../common/dto/standard-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { SingleFileUploadDto } from './dto/request/single-file-upload.dto';
import { Usr } from '../auth/user.decorator';
import { AuthUser } from '../auth/auth-user';
import SUCCESS_MESSAGES from '../util/success-messages';
import { MultipleFileUploadDto } from './dto/request/multiple-file-upload.dto';
import { MULTIPLE_FILE_UPLOAD_TYPE } from '../util/constant';

@ApiTags('file-upload')
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @ApiOperation({
    summary: 'Upload single file',
  })
  @ApiBody({
    type: SingleFileUploadDto,
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return `SUCCESS` with uploaded file key (url)',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @Post('single')
  async uploadSingleFile(
    @Usr() user: AuthUser,
    @UploadedFile()
    file: Express.Multer.File,
    @Body() body: SingleFileUploadDto,
  ) {
    try {
      return new StandardResponse(
        HttpStatus.CREATED,
        SUCCESS_MESSAGES.FILE_UPLOADED_SUCCESSFULLY,
        await this.fileUploadService.uploadSingleFile(user, file, body),
      );
    } catch (e) {
      throw e;
    }
  }
  @ApiOperation({
    summary: 'Upload multiple files',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        // 👈  field names need to be repeated for swagger
        files: {
          type: 'array', // 👈  array of files
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        type: {
          type: 'enum',
          enum: Object.values(MULTIPLE_FILE_UPLOAD_TYPE),
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return `SUCCESS` with uploaded file keys (urls)',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @Post('multiple')
  async uploadMultipleFile(
    @Usr() user: AuthUser,
    @UploadedFiles()
    files: Array<Express.Multer.File>,
    @Body() body: MultipleFileUploadDto,
  ) {
    console.log(body);
    try {
      return new StandardResponse(
        HttpStatus.CREATED,
        SUCCESS_MESSAGES.FILE_UPLOADED_SUCCESSFULLY,
        await this.fileUploadService.uploadMultipleFile(user, files, body),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiOperation({
    summary: 'Get Signed URL for file upload ',
  })
  @ApiBody({
    type: SingleFileUploadDto,
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: '`Development Only.`',
  })
  @UseGuards(JwtAuthGuard)
  @Get('signed-file')
  async getSignedFile(@Query('key') key: string) {
    return new StandardResponse(
      HttpStatus.OK,
      SUCCESS_MESSAGES.SUCCESS,
      await this.fileUploadService.getSignedFile(key),
    );
  }
}
