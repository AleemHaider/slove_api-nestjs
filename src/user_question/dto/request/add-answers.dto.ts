import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddAnswersDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  step: number;

  @ApiProperty()
  profileImage: string;

  @ApiProperty()
  bandName: string;
  @ApiProperty()
  audioUrl: string;
  @ApiProperty()
  city: string;
  @ApiProperty()
  country: string;
  @ApiProperty()
  mobilePhone: string;
  @ApiProperty()
  activeTime: string;
  @ApiProperty()
  gigs: number;
  @ApiProperty()
  bookingPrice: number;
  @ApiProperty()
  websiteLink: string;

  @ApiProperty()
  socialMediaLink: string;
  @ApiProperty()
  spotify: string;
  @ApiProperty()
  facebook: string;
  @ApiProperty()
  instagram: string;
  @ApiProperty()
  youtube: string;

  @ApiProperty()
  additionalLinks: string;

  @ApiProperty()
  artistType: number[];
  @ApiProperty()
  genreType: number[];
  @ApiProperty()
  venueType: number[];

  @ApiProperty()
  organizationName: string;
  @ApiProperty()
  venueName: string;
  @ApiProperty()
  streetName: string;
  @ApiProperty()
  venueCapacity: number;
  @ApiProperty()
  livePerformancePerMonth: number;

  @ApiProperty()
  peakSeason: string;

  @ApiProperty()
  musicianExposure: string;

  @ApiProperty()
  socialMediaFollowers: number;
  @ApiProperty()
  averagePayPerGig: number;

  @ApiProperty()
  galleryImages: string[];

  @ApiProperty()
  firstname: string;
  @ApiProperty()
  lastname: string;
  @ApiProperty({ type: 'number' })
  followerCount: number;
  @ApiProperty({ type: 'number' })
  rating: number;

  @ApiProperty({ type: 'string', example: '10:00-16:40' })
  openHours: string;

  @ApiProperty({ type: 'string' })
  consumerName: string;
  @ApiProperty({ type: 'number' })
  chatId: number;

  @ApiProperty({ type: 'number' })
  countryId: number;
  @ApiProperty({ type: 'number' })
  cityId: number;
  @ApiProperty({ type: 'string' })
  phoneCode: string;
  @ApiProperty({ type: 'string' })
  countryCode: string;
}
