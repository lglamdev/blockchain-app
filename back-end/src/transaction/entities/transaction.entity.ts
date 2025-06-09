
import { Block } from 'src/block/entities/block.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';


@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column()
  amount: string;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Block, block => block.transactions)
  block: Block;

  @ManyToOne(() => User, user => user.sentTransactions)
  sender: User;

  @ManyToOne(() => User, user => user.receivedTransactions)
  receiver: User;
}
