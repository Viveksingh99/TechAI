import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { CmsModule } from './cms/cms.module';
import { AppConfig } from './config/configuration';
import configuration from './config/configuration';
import { CrmModule } from './crm/crm.module';
import { FinanceModule } from './finance/finance.module';
import { HrModule } from './hr/hr.module';
import { MeetingsModule } from './meetings/meetings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { SupportModule } from './support/support.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        throttlers: [
          {
            name: 'default',
            ttl: config.get('throttle.ttl', { infer: true }) * 1000,
            limit: config.get('throttle.limit', { infer: true }),
          },
        ],
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    NotificationsModule,
    ProjectsModule,
    CrmModule,
    HrModule,
    FinanceModule,
    CmsModule,
    SupportModule,
    MeetingsModule,
    AiModule,
    AdminModule,
    UploadsModule,
    ClientsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
