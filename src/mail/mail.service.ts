import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}
  private logger: Logger = new Logger(MailService.name);

  async sendPasswordResetMail(email: string, token: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'Welcome to Slove! Please Reset your Password',
        template: './password_reset', // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          code: token,
        },
      });
      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }

  async sendRegistrationMail(email: string, token: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'Welcome to Slove ! Confirm your Email',
        template: './registration', // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          code: token,
        },
      });
      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }
  async sendEmailVerificationMail(email: string, token: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'Welcome to Slove ! Verify Your Email',
        template: './verify_resend', // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          code: token,
        },
      });
      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }
}
