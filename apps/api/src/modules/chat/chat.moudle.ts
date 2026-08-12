import { forwardRef, Module } from '@nestjs/common';
import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { FriendsModule } from '../friends/friends.module.js';

@Module({
  imports: [forwardRef(() => FriendsModule)],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}