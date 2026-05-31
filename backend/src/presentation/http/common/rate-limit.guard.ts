import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const user = req.user as { sub?: string } | undefined;
    if (user?.sub) {
      return user.sub;
    }
    return req.ip;
  }
}
