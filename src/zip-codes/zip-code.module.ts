import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZipCodeService } from './zip-code.service';
import { ZipCodeController } from './zip-code.controller';
import { ZipCode } from './entities/zip-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ZipCode])],
  controllers: [ZipCodeController],
  providers: [ZipCodeService],
  exports: [ZipCodeService],
})
export class ZipCodeModule { }
