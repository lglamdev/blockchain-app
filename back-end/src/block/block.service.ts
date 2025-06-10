import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { BlockchainService } from "src/blockchain/blockchain.service";
import { IsNull, Repository } from "typeorm";
import { Block } from "./entities/block.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction } from "src/transaction/entities/transaction.entity";
import { CreateBlockDto } from "./dto/create-block.dto";
import { createHash } from "crypto";

@Injectable()
export class BlockService {
  private readonly logger = new Logger(BlockchainService.name)

  constructor(
    @InjectRepository(Block)
    private readonly blockRepo: Repository<Block>,
    @InjectRepository(Transaction)
    private readonly transRepo: Repository<Transaction>
  ) { }

  async addTransaction(newTransaction: Transaction) {
    try {
      await this.transRepo.save(newTransaction);
      const lastBlock = await this.getLastBlock()

      if (!lastBlock || lastBlock.transactions.length >= 5 || Date.now() - lastBlock.timestamp.getTime() >= 60000) {
        await this.createNewBlock()
      }
    } catch (error) {
      this.logger.error('Failed to add transaction or create block', error.stack);
      throw new Error('Internal transaction processing error');
    }
  }

  async createNewBlock() {
    try {
      const previousBlock = await this.getLastBlock()
      const previousHash = previousBlock?.hash || '0'

      const newBlockDTO = new CreateBlockDto
      newBlockDTO.previousHash = previousHash
      newBlockDTO.transactions = await this.getUnconfirmedTransactions()
      newBlockDTO.hash = this.calculateHash(newBlockDTO)

      const newBlock = this.blockRepo.create(newBlockDTO)

      await this.blockRepo.save(newBlock)
    } catch (error) {
      this.logger.error('Failed to create new block', error.stack);
      throw new Error('Block creation failed');
    }
  }

  async getLastBlock(): Promise<Block | null> {
    try {
      const blocks = await this.blockRepo.find({
        order: { id: 'DESC' },
        take: 1,
      });

      return blocks[0] || null;
    } catch (error) {
      this.logger.error('Failed to fetch last block', error.stack);
      throw new InternalServerErrorException('Unable to retrieve the last block');
    }
  }

  async getUnconfirmedTransactions(): Promise<Transaction[]> {
    return this.transRepo.find({
      where: { block: IsNull() },
      relations: ['block'],
    });
  }

  private calculateHash(blockDTO: CreateBlockDto) {
    const blockData = JSON.stringify(blockDTO.transactions) + Date.now() + blockDTO.previousHash
    const hash = createHash('sha256').update(blockData).digest('hex')
    return hash
  }
}