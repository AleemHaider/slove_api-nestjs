import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty()
  firstname: string;
  @ApiProperty()
  lastname: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  registerType: string;
  @ApiProperty()
  emailVerified: boolean;
  @ApiProperty()
  userType: number | null;
  @ApiProperty()
  onboardingComplete: boolean;

  constructor(
    email: string,
    emailVerified: boolean,
    registerType: string,
    firstname: string,
    lastname: string,
    onboardingComplete: boolean,
    userType: number | null,
  ) {
    this.email = email;
    this.emailVerified = emailVerified;
    this.registerType = registerType;
    this.firstname = firstname;
    this.lastname = lastname;
    this.onboardingComplete = onboardingComplete;
    this.userType = userType;
  }
}
