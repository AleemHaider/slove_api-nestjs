import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupRequestDto } from './dto/request/signup-request.dto';
import { StandardResponse } from '../common/dto/standard-response';
import SUCCESS_MESSAGES from '../util/success-messages';
import { LoginRequestDto } from './dto/request/login-request.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { VerifyMailDto } from './dto/request/verify-mail.dto';
import { ForgotPasswordDto } from './dto/request/forgot-password.dto';
import { ResetPasswordDto } from './dto/request/reset-password.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Usr } from './user.decorator';
import { AuthUser } from './auth-user';
import { ResetPasswordOtpDto } from './dto/request/reset-password-otp.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { ChangePasswordDto } from './dto/request/change-password.dto';
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  private logger: Logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: LoginRequestDto })
  @ApiOperation({
    summary: 'Login as a user',
  })
  @ApiOkResponse({
    description: 'Return access token in header as `authorization`',
    type: LoginResponseDto,
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginRequest: LoginRequestDto,
  ) {
    try {
      const { headers, data } = await this.authService.login(loginRequest);
      res.header('authorization', headers.access_token);
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        data,
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiOperation({
    summary: 'Test Jwt Authentication (development only)',
  })
  @ApiOkResponse({
    description: 'Return `Success` as a response',
  })
  @ApiBearerAuth()
  @Get('token-status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async tokenStatus() {
    this.logger.log('token status');
    return new StandardResponse(HttpStatus.OK, SUCCESS_MESSAGES.SUCCESS);
  }

  @ApiOperation({
    summary: 'Resend verify email',
  })
  @ApiOkResponse({
    description: 'Return `Success` as a response',
  })
  @ApiBearerAuth()
  @Get('resend-verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async resendVerifyEmail(@Usr() user: AuthUser) {
    this.logger.log('resend verify email');
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.authService.resendVerifyEmail(user),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBody({ type: VerifyMailDto })
  @ApiOperation({
    summary: 'verify user email',
  })
  @ApiOkResponse({
    description: 'Return `Success` as a response.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyMail(
    @Usr() user: AuthUser,
    @Body() verifyMailDto: VerifyMailDto,
  ) {
    // this.logger.log(user.email);
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.authService.verifyEmail(user, verifyMailDto),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBody({ type: ChangePasswordDto })
  @ApiOperation({
    summary: 'change user password',
  })
  @ApiOkResponse({
    description: 'Return `Success` as a response.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Usr() user: AuthUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.authService.changePassword(user, changePasswordDto),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBody({ type: ForgotPasswordDto })
  @ApiOperation({
    summary: 'request to reset password',
  })
  @ApiOkResponse({
    description: 'Return `Success` as a response',
  })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async requestResetPassword(@Body() passwordDto: ForgotPasswordDto) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.authService.requestResetPassword(passwordDto),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBody({ type: ResetPasswordOtpDto })
  @ApiOperation({
    summary: 'reset password send otp',
  })
  @ApiOkResponse({
    description: 'Return `Success` as a response',
  })
  @Post('reset-password/otp')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordOtpDto) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.authService.resetPassword(resetPasswordDto),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBody({ type: ResetPasswordDto })
  @ApiOperation({
    summary: 'reset password send otp',
  })
  @ApiOkResponse({
    description: 'Return `Success` as a response',
  })
  @Put('reset-password/password')
  @HttpCode(HttpStatus.OK)
  async resetPasswordSendPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      const data = await this.authService.resetPasswordSendPassword(
        resetPasswordDto,
      );
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        data,
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBody({ type: SignupRequestDto })
  @ApiOperation({
    summary: 'create new user',
  })
  @ApiOkResponse({
    description:
      'Return `Success` as a response.for type use 1 for custom user.social login respectively 2,3 and so on',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Res({ passthrough: true }) res: Response,
    @Body() signupRequest: SignupRequestDto,
  ) {
    try {
      const { headers } = await this.authService.signup(signupRequest);
      res.header('authorization', headers.access_token);
      return new StandardResponse(HttpStatus.CREATED, SUCCESS_MESSAGES.SUCCESS);
    } catch (e) {
      throw e;
    }
  }
}
