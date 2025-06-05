import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from './entities/block.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Block])],
})
export class BlockModule {}