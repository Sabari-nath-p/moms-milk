import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donor } from './entities/donor.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateDonorProfileDto, UpdateDonorProfileDto } from './dto/donor.dto';

@Injectable()
export class DonorsService {
  constructor(
    @InjectRepository(Donor)
    private donorRepository: Repository<Donor>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createProfile(userId: string, createDonorProfileDto: CreateDonorProfileDto): Promise<Donor> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.DONOR) {
      throw new UnauthorizedException('User is not a donor');
    }

    const donor = this.donorRepository.create({
      ...createDonorProfileDto,
      user,
    });

    return this.donorRepository.save(donor);
  }

  async updateProfile(userId: string, updateDonorProfileDto: UpdateDonorProfileDto): Promise<Donor> {
    const donor = await this.donorRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!donor) {
      throw new NotFoundException('Donor profile not found');
    }

    Object.assign(donor, updateDonorProfileDto);
    return this.donorRepository.save(donor);
  }

  async getProfile(userId: string): Promise<Donor> {
    const donor = await this.donorRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!donor) {
      throw new NotFoundException('Donor profile not found');
    }

    return donor;
  }

  async findAvailableDonors(zipCode: string): Promise<Donor[]> {
    return this.donorRepository.find({
      where: {
        isAvailable: true,
        user: { zipCode },
      },
      relations: ['user'],
    });
  }

  async toggleAvailability(userId: string): Promise<Donor> {
    const donor = await this.donorRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!donor) {
      throw new NotFoundException('Donor profile not found');
    }

    donor.isAvailable = !donor.isAvailable;
    return this.donorRepository.save(donor);
  }
}
