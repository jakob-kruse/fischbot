import User from '@model/user';
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique('credentials', ['accessToken', 'accessTokenSecret'])
export default class TwitterConnection {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  created!: Date;

  @OneToOne(() => User, (user) => user.twitterConnection, {
    nullable: true,
  })
  owner!: User;

  @Column()
  accessToken!: string;

  @Column()
  accessTokenSecret!: string;

  @Column({ type: 'varchar', nullable: true })
  confirmationCode!: string | null;
}
