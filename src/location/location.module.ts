import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitiesEntity } from '../entity/cities.entity';
import { CountriesEntity } from '../entity/countries.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CountriesEntity, CitiesEntity])],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
