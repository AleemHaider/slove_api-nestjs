import { Test, TestingModule } from '@nestjs/testing';
import { UserQuestionService } from './user_question.service';

describe('UserQuestionService', () => {
  let service: UserQuestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserQuestionService],
    }).compile();

    service = module.get<UserQuestionService>(UserQuestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
