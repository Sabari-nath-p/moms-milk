import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/entities/user.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  getHello(): string {
    return 'Welcome to MomsMilk API!';
  }

  async getHealthStatus() {
    try {
      // Check database connection
      await this.userRepository.query('SELECT 1');

      return {
        database: {
          status: 'up',
          message: 'Database connection is healthy'
        },
        memory: {
          status: 'up',
          usage: process.memoryUsage().heapUsed / 1024 / 1024,
          unit: 'MB'
        },
        uptime: {
          status: 'up',
          value: process.uptime(),
          unit: 'seconds'
        }
      };
    } catch (error) {
      return {
        database: {
          status: 'down',
          message: error.message
        },
        memory: {
          status: 'up',
          usage: process.memoryUsage().heapUsed / 1024 / 1024,
          unit: 'MB'
        },
        uptime: {
          status: 'up',
          value: process.uptime(),
          unit: 'seconds'
        }
      };
    }
  }
}
