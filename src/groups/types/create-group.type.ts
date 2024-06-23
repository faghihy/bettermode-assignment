import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateGroup {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  userIds: string[];

  @Field()
  groupIds: string[];
}
