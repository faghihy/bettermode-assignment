import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateGroup {
  @Field()
  name: string;

  @Field()
  ownerId: string;

  @Field()
  userIds: string[];

  @Field()
  groupIds: string[];
}
