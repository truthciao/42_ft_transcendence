import { Module } from '@nestjs/common';
import { RealtimeMoudule } from '../realtime/realtime.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './gateways/chat.gateway';

@Module({
  imports: [RealtimeMoudule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
