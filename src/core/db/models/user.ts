import TwitterConnection from '@model/twitterConnection';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  telegramId!: number;

  @OneToOne(() => TwitterConnection, (connection) => connection.owner, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  twitterConnection!: TwitterConnection | null;
}
