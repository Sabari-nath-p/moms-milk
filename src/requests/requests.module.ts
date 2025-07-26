import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { Donor } from '../donors/entities/donor.entity';
import { Buyer } from '../buyers/entities/buyer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Request, Donor, Buyer])],
  providers: [RequestsService],
  controllers: [RequestsController],
})
export class RequestsModule {}
