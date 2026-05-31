import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { REDIS_CLIENT } from '@infrastructure/redis/redis.constants';
import Redis from 'ioredis';
import { inline, multiline } from '@shared/i18n/bilingual';
import { SWAGGER_OPERATIONS, SWAGGER_RESPONSES, SWAGGER_TAGS } from '@presentation/http/docs/swagger.i18n';

type HealthStatus = 'up' | 'down';
interface HealthChecks {
  database: HealthStatus;
  cache: HealthStatus;
}

@ApiTags(inline(SWAGGER_TAGS.health))
@Controller('health')
export class HealthController {
  private static readonly HEALTHY_STATUS = 'ok';
  private static readonly DEGRADED_STATUS = 'degraded';
  private static readonly COMPONENT_UP: HealthStatus = 'up';
  private static readonly COMPONENT_DOWN: HealthStatus = 'down';

  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  @Get()
  @ApiOperation({
    summary: inline(SWAGGER_OPERATIONS.health.check.summary),
    description: multiline(SWAGGER_OPERATIONS.health.check.description),
  })
  @ApiOkResponse({ description: inline(SWAGGER_RESPONSES.health.check.ok) })
  async getHealth() {
    const [databaseResult, cacheResult] = await Promise.allSettled([
      this.prisma.$queryRaw`SELECT 1`,
      this.redis.ping(),
    ]);

    const checks = this.buildChecks(databaseResult, cacheResult);

    return {
      status: this.resolveOverallStatus(checks),
      checks,
    };
  }

  private buildChecks(
    databaseResult: PromiseSettledResult<unknown>,
    cacheResult: PromiseSettledResult<unknown>,
  ): HealthChecks {
    return {
      database: HealthController.resolveComponentStatus(databaseResult),
      cache: HealthController.resolveComponentStatus(cacheResult),
    };
  }

  private resolveOverallStatus(checks: HealthChecks): string {
    return Object.values(checks).every((status) => status === HealthController.COMPONENT_UP)
      ? HealthController.HEALTHY_STATUS
      : HealthController.DEGRADED_STATUS;
  }

  private static resolveComponentStatus(result: PromiseSettledResult<unknown>): HealthStatus {
    return result.status === 'fulfilled' ? HealthController.COMPONENT_UP : HealthController.COMPONENT_DOWN;
  }
}
