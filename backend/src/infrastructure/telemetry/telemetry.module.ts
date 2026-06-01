import { Global, Module } from '@nestjs/common';
import { TOKENS } from '@shared/tokens';
import { TelemetryServiceImpl } from './telemetry.service';

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
