import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CountriesEntity } from '../entity/countries.entity';
import { CitiesEntity } from '../entity/cities.entity';
import ERROR_MESSAGES from '../util/error-messages';
import { CountryListDto } from './response/country-list.dto';
import { CityListDto } from './response/city-list.dto';

@Injectable()
export class LocationService {
  private logger: Logger = new Logger(LocationService.name);

  constructor(
    @InjectRepository(CountriesEntity)
    private readonly countriesEntityRepository: Repository<CountriesEntity>,

    @InjectRepository(CitiesEntity)
    private readonly citiesEntityRepository: Repository<CitiesEntity>,

    private readonly dataSource: DataSource,
  ) {}
  async getCountry() {
    try {
      const data = await this.dataSource.manager.query(
        `select id,name,phone_code as phone_code,capital,currency,iso2,iso3,numeric_code from countries where status='ACTIVE'`,
      );
      return new CountryListDto(data).getList();
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCity(countryId: string) {
    try {
      const data = await this.dataSource.manager.query(
        `select id,name,country_id from cities where  status='ACTIVE'  ${
          countryId ? `and country_id='${countryId}'` : ''
        }`,
      );
      return new CityListDto(data).getList();
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
