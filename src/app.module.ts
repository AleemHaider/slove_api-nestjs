import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { UserModule } from './user/user.module';
import { UserQuestionModule } from './user_question/user_question.module';
import { PreferenceModule } from './preference/preference.module';
import { S3BucketService } from './s3-bucket/s3-bucket.service';
import { FileUploadModule } from './file-upload/file-upload.module';
import { BookingModule } from './booking/booking.module';
import { LocationModule } from './location/location.module';
import { ContactModule } from './contact/contact.module';
import { CalendarModule } from './calendar/calendar.module';
import { MetadataModule } from './metadata/metadata.module';
import { OrderModule } from './order/order.module';
import { StripeModule } from './stripe/stripe.module';
import { RequestLoggerMiddleware } from './request-logger/request-logger.middleware';
import { FeedbackModule } from './feedback/feedback.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        port: configService.get<number>('DATABASE_PORT'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [__dirname + '/entity/*.entity{.ts,.js}'],
        synchronize: configService.get<number>('SYNC_MODE') == 1,
      }),
    }),
    AuthModule,
    MailModule,
    UserModule,
    UserQuestionModule,
    PreferenceModule,
    FileUploadModule,
    BookingModule,
    LocationModule,
    ContactModule,
    CalendarModule,
    MetadataModule,
    OrderModule,
    StripeModule,
    FeedbackModule,
    HealthModule,
  ],
  controllers: [],
  providers: [S3BucketService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
