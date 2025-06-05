import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';


@Entity()
export class Block {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  previousHash: string;

  @Column()
  hash: string;

  @OneToMany(() => Transaction, tx => tx.block, { cascade: true })
  transactions: Transaction[];

  @CreateDateColumn()
  timestamp: Date;
}
