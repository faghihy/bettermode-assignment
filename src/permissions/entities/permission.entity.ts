import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Tweet } from 'src/tweets/entities/tweet.entity';

@Entity()
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
