import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TOKENS } from '@shared/tokens';
import { TelemetryServiceImpl } from '@infrastructure/telemetry/telemetry.service';
import { inline, multiline } from '@shared/i18n/bilingual';
import { SWAGGER_OPERATIONS, SWAGGER_RESPONSES, SWAGGER_TAGS } from '@presentation/http/docs/swagger.i18n';

@ApiTags(inline(SWAGGER_TAGS.metrics))
@Controller('metrics')
export class MetricsController {
  constructor(@Inject(TOKENS.TELEMETRY) private readonly telemetry: TelemetryServiceImpl) {}

  @Get()
  @ApiOperation({
    summary: inline(SWAGGER_OPERATIONS.metrics.scrape.summary),
    description: multiline(SWAGGER_OPERATIONS.metrics.scrape.description),
  })
  @ApiOkResponse({ description: inline(SWAGGER_RESPONSES.metrics.scrape.ok) })
  async getMetrics(): Promise<string> {
    return this.telemetry.metricsRegister.metrics();
  }
}
