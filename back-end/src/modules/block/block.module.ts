import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from '../../database/entities/block.entity';
import { BlockService } from './block.service';
import { BlockController } from './block.controller';
import { Transaction } from 'src/database/entities/transaction.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Block, Transaction])],
  controllers: [BlockController],
  providers: [BlockService],
  exports: [BlockService]
})
export class BlockModule {}