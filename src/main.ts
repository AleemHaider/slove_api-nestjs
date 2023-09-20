import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './setup-swagger';
import { ValidationPipe } from '@nestjs/common';

import { WinstonModule } from 'nest-winston';
import { transports, format } from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
    logger: WinstonModule.createLogger({
      transports: [
        // let's log errors into its own file
        //  on daily rotation (error only)
        new DailyRotateFile({
          // %DATE will be replaced by the current date
          filename: `logs/%DATE%-error.log`,
          level: 'error',
          format: format.combine(format.timestamp(), format.json()),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false, // don't want to zip our logs
          maxFiles: '30d', // will keep log until they are older than 30 days
        }),
        // logging all level
        new DailyRotateFile({
          filename: `logs/%DATE%-combined.log`,
          format: format.combine(format.timestamp(), format.json()),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: '15d',
        }),
        // we also want to see logs in our console
        new transports.Console({
          format: format.combine(
            format.cli(),
            format.splat(),
            format.timestamp(),
            format.printf((info) => {
              return `${info.timestamp} ${info.level}: ${info.message}`;
            }),
            // format.prettyPrint(),
          ),
        }),
      ],
    }),
  });
  // app.useLogger(app.get(Logger));
  // app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  if (process.env.NODE_ENV != 'production') {
    setupSwagger(app);
  }

  await app.listen(process.env.PORT || 3000);
}
bootstrap().then(() => console.log('Application started'));
