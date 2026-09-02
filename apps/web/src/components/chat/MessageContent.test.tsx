// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MessageContent } from './MessageContent';

describe('MessageContent XSS safety', () => {
  const renderMessage = (content: string) => {
    render(
      <MessageContent
        content={content}
        type="text"
        apiBaseUri="/api"
        downloadLabel="Download File"
      />,
    );
  };

  it.each([
    "<script>alert('xss')</script>",
    "<img src=x onerror=alert('xss')>",
    "<svg onload=alert('xss')></svg>",
  ])('renders malicious content as plain text: %s', (payload) => {
    renderMessage(payload);

    expect(screen.getByText(payload)).toBeTruthy();

    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('img')).toBeNull();
    expect(document.querySelector('svg')).toBeNull();
  });
});
