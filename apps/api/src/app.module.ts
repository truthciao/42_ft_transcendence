import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ProfilesModule } from './modules/profiles/profiles.module.js';
import { WorkspacesMoudule } from './modules/workspaces/workspaces.module.js';
import { RealtimeMoudule } from './modules/realtime/realtime.module.js';
import { ChatModule } from './modules/chat/chat.moudle.js';
import { FriendsModule } from './modules/friends/friends.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProfilesModule,
    WorkspacesMoudule,
    RealtimeMoudule,
    ChatModule,
    FriendsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
