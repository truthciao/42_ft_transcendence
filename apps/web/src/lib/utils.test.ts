import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('combines class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('ignores falsy conditional classes', () => {
    expect(cn('base', false, undefined, null)).toBe('base');
  });

  it('resolves conflicting Tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
