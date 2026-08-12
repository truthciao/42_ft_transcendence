import { forwardRef, Module } from '@nestjs/common';
import { FriendsController } from './friends.controller.js';
import { FriendsService } from './friends.service.js';
import { ChatModule } from '../chat/chat.moudle.js';

@Module({
  imports: [forwardRef(() => ChatModule)],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
