import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected async getTracker(req: Request & { user?: { sub?: string } }): Promise<string> {
    const user = req.user;
    if (user?.sub) {
      return user.sub;
    }
    return req.ip ?? req.socket.remoteAddress ?? 'anonymous';
  }
}
