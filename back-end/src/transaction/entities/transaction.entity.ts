
import { Block } from 'src/block/entities/block.entity';
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

  @ManyToOne(() => Block, (block) => block.transactions)
  block: Block;
}
