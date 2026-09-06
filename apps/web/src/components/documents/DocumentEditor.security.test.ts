// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

describe('Tiptap XSS safety', () => {
  const createEditor = (content: string) => {
    return new Editor({
      extensions: [
        StarterKit.configure({
          undoRedo: false,
        }),
      ],
      content,
    });
  };

  it('does not preserve a javascript: URL as an executable link', () => {
    const editor = createEditor(
      '<p><a href="javascript:alert(1)">Click me</a></p>',
    );

    const html = editor.getHTML();

    expect(html).not.toContain('javascript:alert(1)');
    expect(html).not.toContain('<a href="javascript:');
    
    editor.destroy();
  });

  it('does not preserve a data:text/html URL as a link', () => {
    const editor = createEditor(
      '<p><a href="data:text/html,<script>alert(1)</script>">Click me</a></p>',
    );

    const html = editor.getHTML();

    expect(html).not.toContain('data:text/html');
    
    editor.destroy();
  });

  it('preserves a normal https URL', () => {
    const editor = createEditor(
      '<p><a href="https://example.com">Example</a></p>',
    );

    const html = editor.getHTML();

    expect(html).toContain('href="https://example.com"');
    
    editor.destroy();
  });

  it('does not create a script element from script HTML', () => {
    const editor = createEditor(
      '<p>Hello</p><script>alert(1)</script>',
    );

    const html = editor.getHTML();

    expect(html).not.toContain('<script');

    editor.destroy();
  });
});