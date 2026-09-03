import { forwardRef, Module } from '@nestjs/common';
import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { FriendsModule } from '../friends/friends.module.js';
import { ChatGateway } from './gateways/chat.gateway.js';
import { RealtimeModule } from '../realtime/realtime.module.js';

@Module({
  imports: [forwardRef(() => FriendsModule), RealtimeModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
