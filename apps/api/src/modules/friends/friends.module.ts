import { forwardRef, Module } from '@nestjs/common';
import { FriendsController } from './friends.controller.js';
import { FriendsService } from './friends.service.js';
import { ChatModule } from '../chat/chat.moudle.js';
import { RealtimeMoudule } from '../realtime/realtime.module.js';

@Module({
  imports: [forwardRef(() => ChatModule), RealtimeMoudule,],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
