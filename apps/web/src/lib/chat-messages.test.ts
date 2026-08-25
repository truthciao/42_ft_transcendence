import { describe, expect, it } from 'vitest';
import type { ChatMessage } from '../api/chat';
import { mergeMessages } from './chat-messages';

describe('mergeMessages', () => {
  it('adds a new message', () => {
    const existing: ChatMessage[] = [
      {
        id: 1,
        conversationId: 1,
        content: 'Hello',
        senderId: 1,
        createdAt: '2026-08-25T10:00:00.000Z',
        sender: {
          id: 1,
          username: 'alice',
        },
      },
    ];

    const incoming: ChatMessage = {
      id: 2,
      conversationId: 1,
      content: 'Hi',
      senderId: 2,
      createdAt: '2026-08-25T10:01:00.000Z',
      sender: {
        id: 2,
        username: 'bob',
      },
    };

    const result = mergeMessages(existing, incoming);

    expect(result).toEqual([existing[0], incoming]);
  });

    it('does not add a duplicate message', () => {
    const existing: ChatMessage[] = [
      {
        id: 1,
        conversationId: 1,
        content: 'Hello',
        senderId: 1,
        createdAt: '2026-08-25T10:00:00.000Z',
        sender: {
          id: 1,
          username: 'alice',
        },
      },
    ];

    const incoming: ChatMessage = {
      id: 1,
      conversationId: 1,
      content: 'Hello',
      senderId: 1,
      createdAt: '2026-08-25T10:00:00.000Z',
      sender: {
        id: 1,
        username: 'alice',
      },
    };

    const result = mergeMessages(existing, incoming);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(existing[0]);
  });

  it('sorts messages by createdAt', () => {
  const first: ChatMessage = {
    id: 1,
    conversationId: 1,
    content: 'First',
    senderId: 1,
    createdAt: '2026-08-25T10:00:00.000Z',
    sender: {
      id: 1,
      username: 'alice',
    },
  };

  const second: ChatMessage = {
    id: 2,
    conversationId: 1,
    content: 'Second',
    senderId: 2,
    createdAt: '2026-08-25T10:01:00.000Z',
    sender: {
      id: 2,
      username: 'bob',
    },
  };

  const result = mergeMessages([second], first);

  expect(result).toEqual([first, second]);
});
});