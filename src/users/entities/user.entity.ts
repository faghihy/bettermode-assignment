import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { InputType, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
@InputType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;
}
