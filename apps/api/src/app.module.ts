import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { WorkspacesMoudule } from './modules/workspaces/workspaces.module';
import { RealtimeMoudule } from './modules/realtime/realtime.module';
import { ChatModule } from './modules/chat/chat.moudle';
import { FriendsModule } from './modules/friends/friends.module';

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
})
export class AppModule {}
