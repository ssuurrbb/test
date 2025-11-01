import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  // создаём мок объекта Repository
  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('сервис должен быть определён', () => {
    expect(service).toBeDefined();
  });

  it('create() должен вызывать repo.create() и repo.save()', async () => {
    const userData = { email: 'test@mail.com', password: '123456' };
    const createdUser = { id: 1, ...userData };

    mockRepo.create.mockReturnValue(userData);
    mockRepo.save.mockResolvedValue(createdUser);

    const result = await service.create(userData.email, userData.password);

    expect(mockRepo.create).toHaveBeenCalledWith(userData);
    expect(mockRepo.save).toHaveBeenCalledWith(userData);
    expect(result).toEqual(createdUser);
  });

  it('findByEmail() должен возвращать пользователя по email', async () => {
    const user = { id: 1, email: 'user@mail.com', password: '123' };
    mockRepo.findOne.mockResolvedValue(user);

    const result = await service.findByEmail('user@mail.com');
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { email: 'user@mail.com' } });
    expect(result).toEqual(user);
  });

  it('findById() должен возвращать пользователя по id', async () => {
    const user = { id: 2, email: 'user2@mail.com', password: '456' };
    mockRepo.findOne.mockResolvedValue(user);

    const result = await service.findById(2);
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
    expect(result).toEqual(user);
  });
});
