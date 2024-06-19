import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Resolver()
export class UserResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => [User])
  users() {}

  @Mutation(() => User)
  createUser() {}
}
