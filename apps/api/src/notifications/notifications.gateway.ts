import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Notification } from '@prisma/client';
import type { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

// Free, self-hosted real-time push for the admin Notification Center —
// socket.io runs inside this same Nest process, no third-party service
// (Firebase/Supabase, etc.) needed. Every connected admin/staff client
// joins one shared "admins" room since notifications are shop-wide, not
// per-user; there's no per-connection state to track beyond that.
// path is under /api/ (not socket.io's own default "/socket.io/") so the
// existing nginx `location /api/` block routes this to the api container
// too, in production — see nginx/florie.conf. Client side (use-
// notifications-socket.ts) must use this exact same path.
@Injectable()
@WebSocketGateway({
  namespace: '/notifications',
  path: '/api/socket.io/',
  cors: { credentials: true },
})
export class NotificationsGateway implements OnGatewayConnection {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException();
      }
      await client.join('admins');
    } catch {
      this.logger.warn(
        `Rejected notifications socket connection: ${client.id}`,
      );
      client.disconnect();
    }
  }

  private extractToken(client: Socket): string {
    const fromAuth = client.handshake.auth?.token as string | undefined;
    const authHeader = client.handshake.headers.authorization;
    const fromHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;
    const token = fromAuth ?? fromHeader;
    if (!token) throw new UnauthorizedException();
    return token;
  }

  emitNew(notification: Notification): void {
    this.server.to('admins').emit('notification:new', notification);
  }
}
