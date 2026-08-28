import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller.js';
import { ProfilesService } from './profiles.service.js';
import { RealtimeModule } from '../realtime/realtime.module.js';

@Module({
  imports: [RealtimeModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}