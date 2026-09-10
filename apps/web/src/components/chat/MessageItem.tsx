import type { ChatMessage } from '@/api/chat';
import { MessageContent } from './MessageContent';

interface MessageItemProps {
  message: ChatMessage;
  isMine: boolean;
  senderLabel: string;
  highlighted: boolean;
  apiBaseUri: string;
  downloadLabel: string;
}

export function MessageItem({
  message,
  isMine,
  senderLabel,
  highlighted,
  apiBaseUri,
  downloadLabel,
}: MessageItemProps) {
  return (
    <div
      id={`message-${message.id}`}
      className={`flex flex-col mb-2 ${
        isMine ? 'items-end' : 'items-start'
      }`}
    >
      <span className="text-[10px] text-muted-foreground mb-1">
        {senderLabel}
      </span>

      <div
        className={`p-2.5 rounded-lg max-w-[70%] w-fit text-sm break-words ${
          isMine
            ? 'bg-primary text-primary-foreground'
            : 'bg-accent text-accent-foreground'
        } ${
          highlighted
            ? 'ring-2 ring-amber-400 shadow-md shadow-amber-400/30'
            : ''
        }`}
      >
        <MessageContent
          content={message.content}
          type={message.type}
          apiBaseUri={apiBaseUri}
          downloadLabel={downloadLabel}
        />
      </div>
    </div>
  );
}