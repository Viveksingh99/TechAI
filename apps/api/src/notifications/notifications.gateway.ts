import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppConfig } from '../config/configuration';

interface JwtAccessPayload {
  sub: string;
  email: string;
}

/**
 * Realtime notifications gateway, mounted at the `/ws` namespace. Clients
 * authenticate by passing their access token via `handshake.auth.token`
 * (or a `token` query param) and are joined to a room named `user:<id>`,
 * so any backend service can push events to a specific user via
 * `emitToUser`.
 */
@Injectable()
@WebSocketGateway({
  namespace: 'ws',
  cors: { origin: '*', credentials: true },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  handleConnection(client: Socket): void {
    const token = this.extractToken(client);

    if (!token) {
      this.logger.warn(`Rejecting socket ${client.id}: no auth token`);
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<JwtAccessPayload>(token, {
        secret: this.config.get('jwt.accessSecret', { infer: true }),
      });

      void client.join(this.roomFor(payload.sub));
      client.data.userId = payload.sub;
    } catch {
      this.logger.warn(`Rejecting socket ${client.id}: invalid token`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId?: string },
  ): void {
    if (data?.userId) {
      void client.join(this.roomFor(data.userId));
    }
  }

  /** Emits a realtime event to every socket connected for the given user. */
  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server?.to(this.roomFor(userId)).emit(event, payload);
  }

  private roomFor(userId: string): string {
    return `user:${userId}`;
  }

  private extractToken(client: Socket): string | undefined {
    const authToken = client.handshake.auth?.token as string | undefined;
    const queryToken = client.handshake.query?.token as string | undefined;
    const header = client.handshake.headers?.authorization;

    return (
      authToken ??
      queryToken ??
      (header?.startsWith('Bearer ') ? header.slice(7) : undefined)
    );
  }
}
