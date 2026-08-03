import { Module } from '@nestjs/common';
import { RealtimeGateway } from './gateways/realtime.gateway';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { RealtimeRoomService } from './services/realtime-room.service';
import { SocketRegistryService } from './services/ws-registry.service';
import { WsAuthService } from './services/ws-auth.service';

@Module({
  providers: [
    RealtimeGateway,
    WsAuthService,
    WsJwtGuard,
    SocketRegistryService,
    RealtimeRoomService,
  ],
  exports: [
    RealtimeRoomService,
    SocketRegistryService,
    WsJwtGuard,
    WsAuthService,
  ],
})
export class RealtimeMoudule {}
