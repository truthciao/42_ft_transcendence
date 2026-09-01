import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get('MAIL_HOST');
    const port = this.configService.get('MAIL_PORT');
    const user = this.configService.get('MAIL_USER');
    const pass = this.configService.get('MAIL_PASS');

    // Allow local SMTP servers like Mailhog to work without credentials.
    if (host && port) {
      const transportConfig: any = {
        host,
        port: Number.parseInt(port, 10),
        secure: this.configService.get('MAIL_SECURE') === 'true',
      };

      if (user || pass) {
        transportConfig.auth = {
          user: user || '',
          pass: pass || '',
        };
      }

      this.transporter = nodemailer.createTransport(transportConfig);
    }
  }

  async sendNotificationEmail(
    to: string,
    subject: string,
    type: string,
    data: any,
  ): Promise<void> {
    // Skip if mail is not configured
    if (!this.transporter) {
      this.logger.debug(`Mail not configured, skipping email to ${to}`);
      return;
    }

    try {
      const html = this.renderTemplate(type, data);
      const from = this.configService.get('MAIL_FROM');

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

  private renderTemplate(type: string, data: any): string {
    const templates: Record<string, (data: any) => string> = {
      FRIEND_REQUEST_RECEIVED: (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Friend Request</h2>
          <p style="color: #666; font-size: 16px;">
            <strong>${d.actorName}</strong> sent you a friend request.
          </p>
          <div style="margin: 20px 0;">
            <a href="${d.acceptLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Request
            </a>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      `,

      FRIEND_REQUEST_ACCEPTED: (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Friend Request Accepted</h2>
          <p style="color: #666; font-size: 16px;">
            <strong>${d.actorName}</strong> accepted your friend request!
          </p>
          <div style="margin: 20px 0;">
            <a href="${d.profileLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Profile
            </a>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      `,

      WORKSPACE_INVITE_RECEIVED: (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Workspace Invitation</h2>
          <p style="color: #666; font-size: 16px;">
            <strong>${d.inviterName}</strong> invited you to join <strong>${d.workspaceName}</strong>.
          </p>
          <div style="margin: 20px 0;">
            <a href="${d.inviteLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
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
      `,

      WORKSPACE_INVITE_ACCEPTED: (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Member Joined Workspace</h2>
          <p style="color: #666; font-size: 16px;">
            <strong>${d.actorName}</strong> accepted your invitation to <strong>${d.workspaceName}</strong>.
          </p>
          <div style="margin: 20px 0;">
            <a href="${d.workspaceLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Open Workspace
            </a>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      `,

      WORKSPACE_ROLE_CHANGED: (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Role Changed</h2>
          <p style="color: #666; font-size: 16px;">
            Your role in <strong>${d.workspaceName}</strong> has been changed to <strong>${d.newRole}</strong>.
          </p>
          <div style="margin: 20px 0;">
            <a href="${d.workspaceLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Workspace
            </a>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      `,

      WORKSPACE_MEMBER_REMOVED: (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Removed from Workspace</h2>
          <p style="color: #666; font-size: 16px;">
            You have been removed from <strong>${d.workspaceName}</strong>.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      `,
    };

    return (
      templates[type]?.(data) ||
      `<p style="color: #666;">You have a new notification: ${type}</p>`
    );
  }
}
