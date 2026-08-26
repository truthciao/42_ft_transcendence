import { Module } from '@nestjs/common';

import { RealtimeGateway } from './gateways/realtime.gateway.js';
import { WsJwtGuard } from './guards/ws-jwt.guard.js';
import { RealtimeRoomService } from './services/realtime-room.service.js';
import { SocketRegistryService } from './services/ws-registry.service.js';
import { WsAuthService } from './services/ws-auth.service.js';
import { DocumentsModule } from '../documents/documents.module.js';

@Module({
  imports: [DocumentsModule],
  providers: [
    RealtimeGateway,
    WsAuthService,
    WsJwtGuard,
    SocketRegistryService,
    RealtimeRoomService,
  ],
  exports: [
    RealtimeGateway,
    RealtimeRoomService,
    SocketRegistryService,
    WsJwtGuard,
    WsAuthService,
  ],
})
export class RealtimeModule {}
