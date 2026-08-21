import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkReadiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        checks: {
          database: {
            status: 'up',
          },
        },
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        checks: {
          database: {
            status: 'down',
          },
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
}
