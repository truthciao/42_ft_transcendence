import { jest } from '@jest/globals';
import { MailService } from './mail.service.js';

describe('MailService', () => {
  const configService = {
    get: jest.fn<(key: string) => string | undefined>(),
  };

  let service: MailService;

  beforeEach(() => {
    jest.clearAllMocks();

    configService.get.mockImplementation((key: string) => {
      const config: Record<string, string> = {
        MAIL_HOST: 'smtp.example.com',
        MAIL_PORT: '587',
        MAIL_USER: 'test@example.com',
        MAIL_PASS: 'password',
        MAIL_SECURE: 'false',
        MAIL_FROM: 'test@example.com',
      };

      return config[key];
    });

    service = new MailService(configService as never);
  });

  it('escapes dynamic values in notification email HTML', () => {
    const html = (
      service as unknown as {
        renderTemplate: (
          type: 'FRIEND_REQUEST_RECEIVED',
          data: {
            actorName: string;
            acceptLink: string;
          },
        ) => string;
      }
    ).renderTemplate('FRIEND_REQUEST_RECEIVED', {
      actorName: '<script>alert("xss")</script>',
      acceptLink: 'https://example.com/app/friends',
    });

    expect(html).toContain(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    );

    expect(html).not.toContain(
      '<script>alert("xss")</script>',
    );
  });

  it('escapes dynamic links in notification email HTML', () => {
    const html = (
      service as unknown as {
        renderTemplate: (
          type: 'FRIEND_REQUEST_RECEIVED',
          data: {
            actorName: string;
            acceptLink: string;
          },
        ) => string;
      }
    ).renderTemplate('FRIEND_REQUEST_RECEIVED', {
      actorName: 'Alice',
      acceptLink: 'https://example.com/?foo="bar"&baz=<test>',
    });

    expect(html).toContain(
      'https://example.com/?foo=&quot;bar&quot;&amp;baz=&lt;test&gt;',
    );

    expect(html).not.toContain(
      'https://example.com/?foo="bar"&baz=<test>',
    );
  });
});