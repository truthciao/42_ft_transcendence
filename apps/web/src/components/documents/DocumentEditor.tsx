import { useEffect, useMemo } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';
import { getSocket } from '@/lib/realtime';

interface DocumentEditorProps {
  documentId: number;
  content: string;
  onChange?: (content: string) => void;
}

export function DocumentEditor({
  documentId,
  content,
  onChange,
}: DocumentEditorProps) {
  const ydoc = useMemo(() => new Y.Doc(), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        undoRedo: false,
      }),

      Collaboration.configure({
        document: ydoc,
        field: 'default',
      }),
    ],

    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  // Initialize the editor with the document content.
  useEffect(() => {
    if (!editor) {
      return;
    }

    if (editor.isEmpty && content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Join the document room and receive Yjs updates.
  useEffect(() => {
    const socket = getSocket();

    const handleSync = (data: {
      documentId: number;
      update: number[];
    }) => {
      if (data.documentId !== documentId) {
        return;
      }

      Y.applyUpdate(
        ydoc,
        new Uint8Array(data.update),
        'remote',
      );
    };

    const handleUpdate = (data: {
      documentId: number;
      update: number[];
    }) => {
      if (data.documentId !== documentId) {
        return;
      }

      Y.applyUpdate(
        ydoc,
        new Uint8Array(data.update),
        'remote',
      );
    };

    socket.on('document:sync', handleSync);
    socket.on('document:yjs-update', handleUpdate);

    socket.emit('document:join', {
      documentId,
    });

    return () => {
      socket.emit('document:leave', {
        documentId,
      });

      socket.off('document:sync', handleSync);
      socket.off('document:yjs-update', handleUpdate);
    };
  }, [documentId, ydoc]);

  // Send local Yjs updates to the server.
  useEffect(() => {
    const handleYDocUpdate = (
      update: Uint8Array,
      origin: unknown,
    ) => {
      if (origin === 'remote') {
        return;
      }

      const socket = getSocket();

      socket.emit('document:yjs-update', {
        documentId,
        update: Array.from(update),
      });
    };

    ydoc.on('update', handleYDocUpdate);

    return () => {
      ydoc.off('update', handleYDocUpdate);
    };
  }, [documentId, ydoc]);

  return (
    <EditorContent
      editor={editor}
      className="min-h-100 w-full"
    />
  );
}
