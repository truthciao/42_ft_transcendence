import { useCallback, useState } from 'react';
import { getSocket } from '../../lib/realtime';
import { useDocumentRealtime } from '../../hooks/useDocumentRealtime';

interface DocumentUpdatedData {
  id: number;
  title: string;
  content: string;
  workspaceId: number;
  creatorId: number;
  createdAt: string;
  updatedAt: string;
}

export function RealtimeDocumentTest() {
  const documentId = 1;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleUpdated = useCallback(
    (data: DocumentUpdatedData) => {
      setTitle(data.title);
      setContent(data.content);
    },
    [],
  );

  useDocumentRealtime(documentId, handleUpdated);

  const handleTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;

    setTitle(value);

    getSocket().emit('document:updated', {
      documentId,
      title: value,
    });
  };

  const handleContentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = event.target.value;

    setContent(value);

    getSocket().emit('document:updated', {
      documentId,
      content: value,
    });
  };

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">
        Realtime Document Test
      </h1>

      <input
        value={title}
        onChange={handleTitleChange}
        placeholder="Document title"
        className="border p-2"
      />

      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Document content"
        className="min-h-40 w-full border p-2"
      />
    </div>
  );
}