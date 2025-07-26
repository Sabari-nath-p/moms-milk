import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, RequestStatus } from './entities/request.entity';
import { Donor } from '../donors/entities/donor.entity';
import { Buyer } from '../buyers/entities/buyer.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(Donor)
    private donorRepository: Repository<Donor>,
    @InjectRepository(Buyer)
    private buyerRepository: Repository<Buyer>,
  ) {}

  async createRequest(buyerId: string, donorId: string): Promise<Request> {
    const buyer = await this.buyerRepository.findOne({
      where: { user: { id: buyerId } },
      relations: ['user'],
    });

    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }

    const donor = await this.donorRepository.findOne({
      where: { id: donorId },
      relations: ['user'],
    });

    if (!donor) {
      throw new NotFoundException('Donor not found');
    }

    if (!donor.isAvailable) {
      throw new UnauthorizedException('Donor is not available');
    }

    const request = this.requestRepository.create({
      buyer,
      donor,
      status: RequestStatus.PENDING,
    });

    return this.requestRepository.save(request);
  }

  async updateRequestStatus(requestId: string, donorId: string, status: RequestStatus): Promise<any> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['donor', 'donor.user', 'buyer', 'buyer.user'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.donor.user.id !== donorId) {
      throw new UnauthorizedException('Not authorized to update this request');
    }

    request.status = status;
    await this.requestRepository.save(request);

    // If request is accepted, return donor's contact information
    if (status === RequestStatus.ACCEPTED) {
      return {
        request,
        contactDetails: {
          fullName: request.donor.user.fullName,
          phoneNumber: request.donor.user.phoneNumber,
          email: request.donor.user.email,
          zipCode: request.donor.user.zipCode,
        }
      };
    }

    return { request };
  }

  async getBuyerRequests(buyerId: string): Promise<Request[]> {
    return this.requestRepository.find({
      where: { buyer: { user: { id: buyerId } } },
      relations: ['donor', 'donor.user', 'buyer', 'buyer.user'],
    });
  }

  async getDonorRequests(donorId: string): Promise<Request[]> {
    return this.requestRepository.find({
      where: { donor: { user: { id: donorId } } },
      relations: ['donor', 'donor.user', 'buyer', 'buyer.user'],
    });
  }
}
