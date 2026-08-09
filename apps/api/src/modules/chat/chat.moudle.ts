import { Module } from '@nestjs/common';
import { RealtimeMoudule } from '../realtime/realtime.module.js';
import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { ChatGateway } from './gateways/chat.gateway.js';

@Module({
  imports: [RealtimeMoudule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
