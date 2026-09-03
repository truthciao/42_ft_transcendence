import { forwardRef, Module } from '@nestjs/common';
import { FriendsController } from './friends.controller.js';
import { FriendsService } from './friends.service.js';
import { ChatModule } from '../chat/chat.module.js';
import { RealtimeModule } from '../realtime/realtime.module.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [forwardRef(() => ChatModule), RealtimeModule, MailModule],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
