import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

type NotificationEmailDataMap = {
  FRIEND_REQUEST_RECEIVED: {
    actorName: string;
    acceptLink: string;
  };

  FRIEND_REQUEST_ACCEPTED: {
    actorName: string;
    profileLink: string;
  };

  WORKSPACE_INVITE_RECEIVED: {
    inviterName: string;
    workspaceName: string;
    inviteLink: string;
  };

  WORKSPACE_INVITE_ACCEPTED: {
    actorName: string;
    workspaceName: string;
    workspaceLink: string;
  };

  WORKSPACE_ROLE_CHANGED: {
    workspaceName: string;
    newRole: string;
    workspaceLink: string;
  };

  WORKSPACE_MEMBER_REMOVED: {
    workspaceName: string;
  };
};

type EmailNotificationType = keyof NotificationEmailDataMap;

@Injectable()
export class MailService {
  private transporter: Transporter | undefined;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<string>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');
    const secure =
      this.configService.get<string>('MAIL_SECURE') === 'true';

    // Allow local SMTP servers like Mailhog to work without credentials.
    if (host && port) {
      const transportConfig = {
        host,
        port: Number.parseInt(port, 10),
        secure,
        ...(user || pass
          ? {
              auth: {
                user: user ?? '',
                pass: pass ?? '',
              },
            }
          : {}),
      };

      this.transporter = nodemailer.createTransport(transportConfig);
    }
  }

  async sendNotificationEmail<T extends EmailNotificationType>(
    to: string,
    subject: string,
    type: T,
    data: NotificationEmailDataMap[T],
  ): Promise<void> {
    // Skip if mail is not configured
    if (!this.transporter) {
      this.logger.debug(`Mail not configured, skipping email to ${to}`);
      return;
    }

    try {
      const html = this.renderTemplate(type, data);
      const from = this.configService.get<string>('MAIL_FROM');

      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent to ${to} for type ${type}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to} for type ${type}:`,
        error,
      );
      // Don't throw - let the notification continue even if email fails
    }
  }

  private renderTemplate<T extends EmailNotificationType>(
    type: T,
    data: NotificationEmailDataMap[T],
  ): string {
    switch (type) {
      case 'FRIEND_REQUEST_RECEIVED': {
        const emailData =
          data as NotificationEmailDataMap['FRIEND_REQUEST_RECEIVED'];

        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Friend Request</h2>
            <p style="color: #666; font-size: 16px;">
              <strong>${emailData.actorName}</strong> sent you a friend request.
            </p>
            <div style="margin: 20px 0;">
              <a href="${emailData.acceptLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View Request
              </a>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        `;
      }

      case 'FRIEND_REQUEST_ACCEPTED': {
        const emailData =
          data as NotificationEmailDataMap['FRIEND_REQUEST_ACCEPTED'];

        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Friend Request Accepted</h2>
            <p style="color: #666; font-size: 16px;">
              <strong>${emailData.actorName}</strong> accepted your friend request!
            </p>
            <div style="margin: 20px 0;">
              <a href="${emailData.profileLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View Profile
              </a>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        `;
      }

      case 'WORKSPACE_INVITE_RECEIVED': {
        const emailData =
          data as NotificationEmailDataMap['WORKSPACE_INVITE_RECEIVED'];

        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Workspace Invitation</h2>
            <p style="color: #666; font-size: 16px;">
              <strong>${emailData.inviterName}</strong> invited you to join <strong>${emailData.workspaceName}</strong>.
            </p>
            <div style="margin: 20px 0;">
              <a href="${emailData.inviteLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This invitation expires in 7 days.
            </p>
            <p style="color: #999; font-size: 12px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        `;
      }

      case 'WORKSPACE_INVITE_ACCEPTED': {
        const emailData =
          data as NotificationEmailDataMap['WORKSPACE_INVITE_ACCEPTED'];

        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Member Joined Workspace</h2>
            <p style="color: #666; font-size: 16px;">
              <strong>${emailData.actorName}</strong> accepted your invitation to <strong>${emailData.workspaceName}</strong>.
            </p>
            <div style="margin: 20px 0;">
              <a href="${emailData.workspaceLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Open Workspace
              </a>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        `;
      }

      case 'WORKSPACE_ROLE_CHANGED': {
        const emailData =
          data as NotificationEmailDataMap['WORKSPACE_ROLE_CHANGED'];

        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Role Changed</h2>
            <p style="color: #666; font-size: 16px;">
              Your role in <strong>${emailData.workspaceName}</strong> has been changed to <strong>${emailData.newRole}</strong>.
            </p>
            <div style="margin: 20px 0;">
              <a href="${emailData.workspaceLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View Workspace
              </a>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        `;
      }

      case 'WORKSPACE_MEMBER_REMOVED': {
        const emailData =
          data as NotificationEmailDataMap['WORKSPACE_MEMBER_REMOVED'];

        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Removed from Workspace</h2>
            <p style="color: #666; font-size: 16px;">
              You have been removed from <strong>${emailData.workspaceName}</strong>.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        `;
      }

      default:
        return `<p style="color: #666;">You have a new notification: ${type}</p>`;
    }
  }
}
