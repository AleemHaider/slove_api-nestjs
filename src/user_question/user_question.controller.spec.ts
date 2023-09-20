import { Test, TestingModule } from '@nestjs/testing';
import { UserQuestionController } from './user_question.controller';
import { UserQuestionService } from './user_question.service';

describe('UserQuestionController', () => {
  let controller: UserQuestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserQuestionController],
      providers: [UserQuestionService],
    }).compile();

    controller = module.get<UserQuestionController>(UserQuestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
