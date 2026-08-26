import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router';
import {
  updateDocument,
  useDocumentRealtime,
  type DocumentUpdatePatch,
} from '../hooks/useDocumentRealtime';
import { getDocument, updateDocument as updateDocumentApi } from '../api/documents';

export function DocumentPage() {
  const {
    workspaceId: workspaceIdParam,
    documentId: documentIdParam,
  } = useParams<{
    workspaceId: string;
    documentId: string;
  }>();

  const workspaceId = Number(workspaceIdParam);
  const documentId = Number(documentIdParam);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const handleUpdated = useCallback(
    (data: DocumentUpdatePatch) => {
      if (data.title !== undefined) {
        setTitle(data.title);
      }

      if (data.content !== undefined) {
        setContent(data.content);
      }
    },
    [],
  );

  useDocumentRealtime(documentId, handleUpdated);

  useEffect(() => {
    async function loadDocument() {
      try {
        const document = await getDocument(
          workspaceId,
          documentId,
        );

        setTitle(document.title);
        setContent(document.content);
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [workspaceId, documentId]);

  const scheduleSave = useCallback(
    (patch: {
      title?: string;
      content?: string;
    }) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      setSaveStatus('saving');

      saveTimerRef.current = setTimeout(() => {
        updateDocumentApi(
          workspaceId,
          documentId,
          patch,
        )
          .then(() => {
            setSaveStatus('saved');
          })
          .catch((error) => {
            console.error(
              '[document] failed to save',
              error,
            );

            setSaveStatus('error');
          });
      }, 500);
    },
    [workspaceId, documentId],
  );

  const handleTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;

    setTitle(value);

    // realtime
    updateDocument(
      {
        title: value,
      },
      documentId,
    );

    // persistence
    scheduleSave({
      title: value,
    });
  };

const handleContentChange = (
  event: React.ChangeEvent<HTMLTextAreaElement>,
) => {

  const value = event.target.value;

  setContent(value);

  updateDocument(
    {
      content: value,
    },
    documentId,
  );

  scheduleSave({
    content: value,
  });
};

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && 'Saved'}
          {saveStatus === 'error' && 'Save failed'}
        </span>
      </div>

      <input
        value={title}
        onChange={handleTitleChange}
        placeholder="Document title"
        className="w-full border p-2 text-2xl"
      />

      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Start writing..."
        className="min-h-100 w-full border p-2"
      />
    </div>
  );
}