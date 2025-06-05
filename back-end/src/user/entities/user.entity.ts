import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true })
  walletAddress: string;

  @OneToMany(() => Transaction, tx => tx.sender)
  sentTransactions: Transaction[];

  @OneToMany(() => Transaction, tx => tx.receiver)
  receivedTransactions: Transaction[];
}
