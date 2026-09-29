import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UserRole } from '@prisma/client';
import type { Notification } from '@prisma/client';
import type { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

function roleRoom(role: UserRole): string {
  return `role:${role}`;
}

// Free, self-hosted real-time push for the admin Notification Center —
// socket.io runs inside this same Nest process, no third-party service
// (Firebase/Supabase, etc.) needed. Every connected client joins the shared
// "admins" room (shop-wide notifications, e.g. new customer) plus a
// role-specific room so role-targeted notifications (see
// NotificationsService.create's targetRole) only reach who they're for.
// ADMIN also joins every other role's room — they see everything, and this
// avoids the emit side having to special-case "ADMIN" as an extra target.
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
      // Dùng user.role vừa fetch từ DB (không dùng role trong JWT payload) —
      // đổi role có hiệu lực ngay khi socket này kết nối lại, không cần đợi
      // access token hết hạn, đúng convention JwtStrategy đang dùng.
      await client.join('admins');
      await client.join(roleRoom(user.role));
      if (user.role === UserRole.ADMIN) {
        await client.join(roleRoom(UserRole.OPERATIONS_ADMIN));
        await client.join(roleRoom(UserRole.STAFF));
      }
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

  emitToRole(role: UserRole, notification: Notification): void {
    this.server.to(roleRoom(role)).emit('notification:new', notification);
  }
}
