import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useBlocker, useNavigate, useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { documentKeys, useDocument } from '@/hooks/useDocuments';
import {
  updateDocument,
  type Document,
} from '@/api/documents';
import {
  updateDocument as updateDocumentRealtime,
  useDocumentRealtime,
  type DocumentUpdatePatch,
} from '@/hooks/useDocumentRealtime';
import { useTranslation } from 'react-i18next';

type SaveStatus = 'saved' | 'saving' | 'error';

export function DocumentPage() {
  const {
    workspaceId: workspaceIdParam,
    documentId: documentIdParam,
  } = useParams<{
    workspaceId: string;
    documentId: string;
  }>();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const workspaceId = Number(workspaceIdParam);
  const documentId = Number(documentIdParam);
  const {
    data: document,
    isLoading,
    isError,
  } = useDocument(workspaceId, documentId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const pendingPatchRef = useRef<{
    title?: string;
    content?: string;
  } | null>(null);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const blocker = useBlocker(hasPendingChanges);

  const handleUpdated = useCallback(
    (data: DocumentUpdatePatch) => {
      if (data.title !== undefined) {
        setTitle(data.title);
      }

      if (data.content !== undefined) {
        setContent(data.content);
      }

      queryClient.setQueryData<Document[]>(
        documentKeys.workspace(workspaceId),
        (documents) => {
          if (!documents) {
            return documents;
          }

          return documents.map((document) =>
            document.id === documentId
              ? {
                  ...document,
                  ...data,
                }
              : document,
          );
        },
      );

      queryClient.setQueryData<Document>(
        documentKeys.detail(workspaceId, documentId),
        (document) =>
          document
            ? {
                ...document,
                ...data,
              }
            : document,
      );
    },
    [workspaceId, documentId, queryClient],
  );

  useDocumentRealtime(documentId, handleUpdated);
  useEffect(() => {
    if (!document) {
      return;
    }

    setTitle(document.title);
    setContent(document.content);
  }, [document]);

  const scheduleSave = useCallback(
    (patch: {
      title?: string;
      content?: string;
    }) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      pendingPatchRef.current = {
        ...pendingPatchRef.current,
        ...patch,
      };

      setHasPendingChanges(true);

      setSaveStatus('saving');

      saveTimerRef.current = setTimeout(() => {
        const pendingPatch = pendingPatchRef.current;

        if (!pendingPatch) {
          return;
        }

        updateDocument(
          workspaceId,
          documentId,
          pendingPatch,
        )
          .then(() => {
            queryClient.setQueryData<Document[]>(
              documentKeys.workspace(workspaceId),
              (documents) => {
                if (!documents) {
                  return documents;
                }

                return documents.map((document) =>
                  document.id === documentId
                    ? {
                        ...document,
                        ...pendingPatch,
                      }
                    : document,
                );
              },
            );
            queryClient.setQueryData<Document>(
              documentKeys.detail(workspaceId, documentId),
              (document) =>
                document
                  ? {
                      ...document,
                      ...pendingPatch,
                    }
                  : document,
            );
            pendingPatchRef.current = null;
            setHasPendingChanges(false);
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
    [workspaceId, documentId, queryClient],
  );
  const { t } = useTranslation();

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (blocker.state !== 'blocked') {
      return;
    }

    const pendingPatch = pendingPatchRef.current;

    if (!pendingPatch) {
      blocker.proceed();
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    updateDocument(
      workspaceId,
      documentId,
      pendingPatch,
    )
      .then(() => {
        queryClient.setQueryData<Document[]>(
          documentKeys.workspace(workspaceId),
          (documents) => {
            if (!documents) {
              return documents;
            }

            return documents.map((document) =>
              document.id === documentId
                ? {
                    ...document,
                    ...pendingPatch,
                  }
                : document,
            );
          },
        );

        queryClient.setQueryData<Document>(
          documentKeys.detail(workspaceId, documentId),
          (document) =>
            document
              ? {
                  ...document,
                  ...pendingPatch,
                }
              : document,
        );

        pendingPatchRef.current = null;
        setHasPendingChanges(false);
        setSaveStatus('saved');

        blocker.proceed();
      })
      .catch((error) => {
        console.error(
          '[document] failed to save before navigation',
          error,
        );

        setSaveStatus('error');
        blocker.reset();
      });
  }, [
    blocker,
    workspaceId,
    documentId,
    queryClient,
  ]);

  const handleBack = () => {
    navigate(`/app/spaces/${workspaceId}`);
  };

  const handleTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;

    setTitle(value);

    // realtime
    updateDocumentRealtime(
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

    // realtime
    updateDocumentRealtime(
      {
        content: value,
      },
      documentId,
    );

    // persistence
    scheduleSave({
      content: value,
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-6 p-8">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-12 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-96 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (isError || !document) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-lg font-semibold">
            {t('workspaces.pages.document.notFound')}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {t('workspaces.pages.document.loadError')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center border-b px-6">
        <button
          type="button"
          onClick={handleBack}
        >
          <ArrowLeft className="size-4" />
          <span>{t('workspaces.pages.document.back')}</span>
        </button>

        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{t('workspaces.pages.document.saving')}</span>
            </>
          )}

          {saveStatus === 'saved' && (
            <>
              <Check className="size-4" />
              <span>{t('workspaces.pages.document.saved')}</span>
            </>
          )}

          {saveStatus === 'error' && (
            <span className="text-destructive">
              {t('workspaces.pages.document.saveError')}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-10 py-10">
        <input
          value={title}
          onChange={handleTitleChange}
          placeholder={t('workspaces.pages.document.untitled')}
          className="mb-6 w-full border-none bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-muted-foreground"
        />

        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder={t('workspaces.pages.document.startWriting')}
          className="min-h-100 flex-1 resize-none border-none bg-transparent text-base leading-8 outline-none placeholder:text-muted-foreground"
        />
      </main>
    </div>
  );
}