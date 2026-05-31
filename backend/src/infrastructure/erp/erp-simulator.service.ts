import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErpGateway, ErpGatewayResponse } from '@application/ports/erp-gateway';

@Injectable()
export class ErpSimulatorService implements ErpGateway {
  private readonly failureRate: number;
  private readonly minDelay: number;
  private readonly maxDelay: number;

  constructor(private readonly configService: ConfigService) {
    this.failureRate = Number(this.configService.get('ERP_SIMULATION_FAILURE_RATE', 0.3));
    this.minDelay = Number(this.configService.get('ERP_SIMULATION_MIN_DELAY_MS', 800));
    this.maxDelay = Number(this.configService.get('ERP_SIMULATION_MAX_DELAY_MS', 2500));
  }

  async processOrder(_payload: {
    orderId: string;
    customerId: string;
    items: Array<{ productId: string; quantity: number; priceCents: number }>;
    totalCents: number;
  }): Promise<ErpGatewayResponse> {
    const delay = this.minDelay + Math.random() * (this.maxDelay - this.minDelay);
    await new Promise((resolve) => setTimeout(resolve, delay));

    if (Math.random() < this.failureRate) {
      throw new Error('ERP unavailable');
    }

    return {
      externalOrderId: `ERP-${Date.now()}`,
    };
  }
}
