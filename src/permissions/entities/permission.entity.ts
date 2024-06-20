import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Tweet } from '../../tweets/entities/tweet.entity';
import { ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Tweet)
  @JoinColumn()
  tweet: Tweet;

  @Column()
  inheritViewPermissions: boolean;

  @Column()
  inheritEditPermissions: boolean;

  @Column({ type: 'simple-array', nullable: true })
  viewPermissions: string[];

  @Column({ type: 'simple-array', nullable: true })
  editPermissions: string[];
}
