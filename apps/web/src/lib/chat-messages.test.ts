import { describe, expect, it } from 'vitest';

import type { ChatMessage } from '../api/chat';
import { mergeMessages } from './chat-messages';

function message(
  id: number,
  createdAt: string,
  content = `message-${id}`,
): ChatMessage {
  return {
    id,
    content,
    createdAt,
  } as ChatMessage;
}

describe('mergeMessages', () => {
  it('adds a single incoming message', () => {
    const existing = [
      message(1, '2026-08-27T10:00:00Z'),
    ];

    const result = mergeMessages(
      existing,
      message(2, '2026-08-27T10:01:00Z'),
    );

    expect(result.map((item) => item.id)).toEqual([1, 2]);
  });

  it('merges multiple incoming messages in chronological order', () => {
    const existing = [
      message(2, '2026-08-27T10:02:00Z'),
    ];

    const incoming = [
      message(3, '2026-08-27T10:03:00Z'),
      message(1, '2026-08-27T10:01:00Z'),
    ];

    const result = mergeMessages(existing, incoming);

    expect(result.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it('deduplicates messages by id', () => {
    const existing = [
      message(1, '2026-08-27T10:00:00Z', 'old content'),
    ];

    const incoming = [
      message(1, '2026-08-27T10:00:00Z', 'updated content'),
    ];

    const result = mergeMessages(existing, incoming);

    expect(result).toHaveLength(1);
    expect(result[0]?.content).toBe('updated content');
  });

  it('does not mutate the existing messages array', () => {
    const existing = [
      message(1, '2026-08-27T10:00:00Z'),
    ];

    mergeMessages(
      existing,
      message(2, '2026-08-27T09:00:00Z'),
    );

    expect(existing.map((item) => item.id)).toEqual([1]);
  });

  it('handles an empty existing array', () => {
    const result = mergeMessages([], [
      message(2, '2026-08-27T10:02:00Z'),
      message(1, '2026-08-27T10:01:00Z'),
    ]);

    expect(result.map((item) => item.id)).toEqual([1, 2]);
  });
});
