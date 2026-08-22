import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ProfilesModule } from './modules/profiles/profiles.module.js';
import { WorkspacesModule } from './modules/workspaces/workspaces.module.js';
import { RealtimeModule } from './modules/realtime/realtime.module.js';
import { ChatModule } from './modules/chat/chat.module.js';
import { FriendsModule } from './modules/friends/friends.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { HealthModule } from './modules/health/health.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    ProfilesModule,
    WorkspacesModule,
    RealtimeModule,
    ChatModule,
    FriendsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
