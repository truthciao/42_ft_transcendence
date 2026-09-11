import type { SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  FileUpload,
  type AttachmentType,
} from '@/components/common/FileUpload';

interface MessageInputProps {
  inputText: string;
  onInputChange: (value: string) => void;
  onSendMessage: (event: SubmitEvent) => void;
  onFileUploadSuccess: (attachment: AttachmentType) => void;
}

export function MessageInput({
  inputText,
  onInputChange,
  onSendMessage,
  onFileUploadSuccess,
}: MessageInputProps) {
  const { t } = useTranslation();

  return (
    <form
      onSubmit={onSendMessage}
      className="border-t border-border p-4 bg-background"
    >
      <div className="flex gap-2 items-center">
        <FileUpload
          onUploadSuccess={onFileUploadSuccess}
          context="chat"
        />

        <Input
          type="text"
          autoComplete="off"
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={t(
            'chat.placeholder',
            'Type a message...',
          )}
          className="flex-1 border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />

        <Button type="submit">
          {t('chat.send', 'Send')}
        </Button>
      </div>
    </form>
  );
}