import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entity/user.entity';
import { DataSource, Repository } from 'typeorm';
import { JwtPayload } from './jwt-payload';
import { AuthUser } from './auth-user';
import { SignupRequestDto } from './dto/request/signup-request.dto';
import { EmailVerificationEntity } from '../entity/email-verification.entity';
import ERROR_MESSAGES from '../util/error-messages';
import { MailService } from '../mail/mail.service';
import { LoginRequestDto } from './dto/request/login-request.dto';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service';
import { STATUS, USER_REGISTER_TYPE } from '../util/constant';
import { VerifyMailDto } from './dto/request/verify-mail.dto';
import { ForgotPasswordDto } from './dto/request/forgot-password.dto';
import { PasswordResetEntity } from '../entity/password-reset.entity';
import { ResetPasswordDto } from './dto/request/reset-password.dto';
import generateOTP from '../util/generate-otp';
import { ResetPasswordOtpDto } from './dto/request/reset-password-otp.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { ChangePasswordDto } from './dto/request/change-password.dto';

@Injectable()
export class AuthService {
  private logger: Logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(EmailVerificationEntity)
    private readonly emailVerificationEntityRepository: Repository<EmailVerificationEntity>,
    @InjectRepository(PasswordResetEntity)
    private readonly passwordResetEntityRepository: Repository<PasswordResetEntity>,

    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly dataSource: DataSource,
  ) {}

  async validateUser(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.userRepository.findOne({
      where: { id: payload.id },
    });

    if (user !== null && user.email === payload.email) {
      delete user.password;
      return user;
    }
    throw new UnauthorizedException();
  }

  async signup(dto: SignupRequestDto) {
    const alreadyExist = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (alreadyExist && dto.type != USER_REGISTER_TYPE.CUSTOM) {
      await this.userRepository.update(
        { id: alreadyExist.id },
        { token: dto.token, emailVerified: true },
      );

      return {
        headers: {
          access_token: await this.getJWTPayload(
            alreadyExist.id,
            alreadyExist.email,
          ),
        },
      };
    }

    if (alreadyExist) {
      if (alreadyExist.registerType == USER_REGISTER_TYPE.CUSTOM) {
        throw new ConflictException(ERROR_MESSAGES.USER_ALREADY_EXIST);
      } else {
        throw new NotFoundException(
          `${ERROR_MESSAGES.ALREADY_REGISTER_SOCIAL1} ${
            alreadyExist.registerType || ''
          } ${ERROR_MESSAGES.ALREADY_REGISTER_SOCIAL2}`,
        );
      }
    }

    try {
      const newUser = await this.createNewUser(dto);
      return {
        headers: {
          access_token: await this.getJWTPayload(newUser.id, newUser.email),
        },
      };
    } catch (e) {
      this.logger.error(e);
      // console.log(e);
      if (e.code == '23505') {
        throw new ConflictException(ERROR_MESSAGES.USER_ALREADY_EXIST);
      }
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createNewUser(dto: SignupRequestDto): Promise<UserEntity> {
    let newUser = new UserEntity();
    newUser.email = dto.email;
    if (dto.type == USER_REGISTER_TYPE.CUSTOM && dto.password.length > 0) {
      newUser.password = await this.passwordService.hashPassword(dto.password);
    } else {
      newUser.token = dto.token;
    }
    if (dto.type != USER_REGISTER_TYPE.CUSTOM) {
      newUser.emailVerified = true;
    }
    newUser.registerType = dto.type;
    newUser = await this.userRepository.save(newUser);

    if (dto.type == USER_REGISTER_TYPE.CUSTOM) {
      const emailVerificationToken = generateOTP(6);

      const emailVerificationEntity = new EmailVerificationEntity();
      emailVerificationEntity.otp = emailVerificationToken;
      emailVerificationEntity.user = newUser;
      await this.emailVerificationEntityRepository.save(
        emailVerificationEntity,
      );
      const isEmailSend = await this.mailService.sendRegistrationMail(
        dto.email,
        emailVerificationToken,
      );

      this.logger.log('isEmailSend', isEmailSend);
    }

    return newUser;
  }

  async login(dto: LoginRequestDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: dto.email,
        status: STATUS.ACTIVE,
      },
      relations: ['userType'],
    });
    if (user === null) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    // if (user === null) {
    //   if (dto.type != USER_REGISTER_TYPE.CUSTOM) {
    //
    //   }
    //   user = await this.createNewUser(dto);
    //   return {
    //     headers: {
    //       access_token: await this.getJWTPayload(user.id, user.email),
    //     },
    //     data: new LoginResponseDto(
    //       user.email,
    //       user.emailVerified,
    //       user.registerType,
    //       user.firstname,
    //       user.lastname,
    //       user.onboardingComplete,
    //       user.userType ? user.userType.id : null,
    //     ),
    //   };
    // }

    if (dto.type == USER_REGISTER_TYPE.CUSTOM) {
      if (!user.password) {
        throw new NotFoundException(
          `${ERROR_MESSAGES.ALREADY_REGISTER_SOCIAL1} ${
            user.registerType || ''
          } ${ERROR_MESSAGES.ALREADY_REGISTER_SOCIAL2}`,
        );
      }

      if (
        !(await this.passwordService.validatePassword(
          dto.password,
          user.password,
        )) ||
        dto.password.length < 0
      ) {
        throw new UnauthorizedException(ERROR_MESSAGES.USER_PASSWORD_INCORRECT);
      }
    } else {
      user.token = dto.token;
      user.emailVerified = true;
      await this.userRepository.save(user);
    }

    try {
      return {
        headers: {
          access_token: await this.getJWTPayload(user.id, user.email),
        },
        data: new LoginResponseDto(
          user.email,
          user.emailVerified,
          user.registerType,
          user.firstname,
          user.lastname,
          user.onboardingComplete,
          user.userType ? user.userType.id : null,
        ),
      };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getJWTPayload(id: number, email: string) {
    const payload: JwtPayload = {
      id: id,
      email: email,
    };
    return await this.generateJWTPayload(payload);
  }
  async generateJWTPayload(payload: JwtPayload) {
    return await this.jwtService.signAsync(payload);
  }

  async verifyEmail(currentUser: UserEntity, dto: VerifyMailDto) {
    const emailVerification =
      await this.emailVerificationEntityRepository.findOne({
        where: {
          otp: dto.otp,
          user: {
            email: currentUser.email,
          },
        },
        relations: ['user'],
      });

    if (emailVerification == null || emailVerification.otp != dto.otp) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_OTP);
    }
    if (emailVerification.validUntil < new Date()) {
      throw new BadRequestException(ERROR_MESSAGES.TOKEN_EXPIRED);
    }

    try {
      await this.userRepository.update(
        { id: emailVerification.user.id },
        { emailVerified: true },
      );
      await this.emailVerificationEntityRepository.remove(emailVerification);
      return;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async requestResetPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
    });
    if (user == null) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    try {
      // not optimized.delete later.keep for testing
      const oldPasswordRequest = await this.passwordResetEntityRepository.find({
        where: {
          user: {
            email: user.email,
          },
        },
      });
      await this.passwordResetEntityRepository.remove(oldPasswordRequest);
      const passwordResetToken = generateOTP();
      const passwordResetEntity = new PasswordResetEntity();
      passwordResetEntity.otp = passwordResetToken;
      passwordResetEntity.user = user;
      await this.passwordResetEntityRepository.save(passwordResetEntity);
      const isEmailSend = await this.mailService.sendPasswordResetMail(
        dto.email,
        passwordResetToken,
      );

      this.logger.log('isEmailSend', isEmailSend);
      //send email
      return;
    } catch (e) {
      console.log(e);
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resetPassword(dto: ResetPasswordOtpDto) {
    this.logger.log('reset password');
    const passwordRequest = await this.passwordResetEntityRepository.findOne({
      where: {
        otp: dto.otp,
        user: {
          email: dto.email,
        },
      },
      relations: ['user'],
    });
    if (passwordRequest == null) {
      throw new NotFoundException(ERROR_MESSAGES.INVALID_OTP);
    }

    if (passwordRequest.validUntil < new Date()) {
      throw new BadRequestException(ERROR_MESSAGES.TOKEN_EXPIRED);
    }

    try {
      await this.passwordResetEntityRepository.update(
        { id: passwordRequest.id },
        { status: STATUS.INACTIVE },
      );
      return;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resendVerifyEmail(currentUser: UserEntity) {
    const emailVerification =
      await this.emailVerificationEntityRepository.findOne({
        where: {
          user: {
            email: currentUser.email,
          },
        },
        relations: ['user'],
        select: ['id', 'user'],
      });
    if (emailVerification && emailVerification.user.emailVerified == true) {
      throw new BadRequestException(ERROR_MESSAGES.ALREADY_VERIFIED_USER);
    }
    const newOtp = generateOTP();
    try {
      if (emailVerification) {
        await this.emailVerificationEntityRepository.delete({
          id: emailVerification.id,
        });
      }
      const emailVerificationEntity = new EmailVerificationEntity();
      emailVerificationEntity.otp = newOtp;
      emailVerificationEntity.user = currentUser;
      await this.emailVerificationEntityRepository.save(
        emailVerificationEntity,
      );

      const isEmailSend = await this.mailService.sendEmailVerificationMail(
        currentUser.email,
        newOtp,
      );
      this.logger.log('isEmailSend', isEmailSend);
      ///////////////////////////
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resetPasswordSendPassword(dto: ResetPasswordDto) {
    const passwordRequest = await this.passwordResetEntityRepository.findOne({
      where: {
        user: {
          email: dto.email,
        },
        status: STATUS.INACTIVE,
      },
      relations: ['user'],
    });

    if (passwordRequest == null) {
      throw new BadRequestException(ERROR_MESSAGES.PASSWORD_RESET_FAILED);
    }
    this.logger.log('passwordRequest', passwordRequest.id);

    try {
      const hashedPassword = await this.passwordService.hashPassword(
        dto.password,
      );

      await this.dataSource.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.remove(passwordRequest);
          await transactionalEntityManager.update(
            UserEntity,
            passwordRequest.user.id,
            {
              password: hashedPassword,
            },
          );
        },
      );
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changePassword(currentUser: UserEntity, dto: ChangePasswordDto) {
    if (dto.newPassword.length == 0) {
      throw new BadRequestException(
        ERROR_MESSAGES.NEW_PASSWORD_CANNOT_BE_EMPTY,
      );
    }
    const user = await this.userRepository.findOne({
      where: {
        id: currentUser.id,
      },
    });
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    const isPasswordMatch = await this.passwordService.validatePassword(
      dto.oldPassword,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new BadRequestException(ERROR_MESSAGES.OLD_PASSWORD_INCORRECT);
    }
    try {
      await this.userRepository.update(
        { id: user.id },
        { password: await this.passwordService.hashPassword(dto.newPassword) },
      );
      return;
    } catch (e) {
      this.logger.error(e);
    }
  }
}
