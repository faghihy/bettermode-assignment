import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateGroup {
  @Field()
  name: string;

  @Field()
  ownerId: string;

  @Field(() => [String])
  userIds: string[];

  @Field(() => [String])
  groupIds: string[];
}
