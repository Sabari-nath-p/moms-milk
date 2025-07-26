import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Buyer } from './entities/buyer.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class BuyersService {
  constructor(
    @InjectRepository(Buyer)
    private buyerRepository: Repository<Buyer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createProfile(userId: string): Promise<Buyer> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.BUYER) {
      throw new UnauthorizedException('User is not a buyer');
    }

    const buyer = this.buyerRepository.create({ user });
    return this.buyerRepository.save(buyer);
  }

  async getProfile(userId: string): Promise<Buyer> {
    const buyer = await this.buyerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!buyer) {
      throw new NotFoundException('Buyer profile not found');
    }

    return buyer;
  }
}
