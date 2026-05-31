import { Global, Module } from '@nestjs/common';
import { TelemetryServiceImpl } from './telemetry.service';
import { TOKENS } from '@shared/tokens';

@Global()
@Module({
  providers: [
    {
      provide: TOKENS.TELEMETRY,
      useClass: TelemetryServiceImpl,
    },
  ],
  exports: [TOKENS.TELEMETRY],
})
export class TelemetryModule {}
