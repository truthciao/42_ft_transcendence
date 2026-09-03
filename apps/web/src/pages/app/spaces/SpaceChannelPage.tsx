import { useParams } from 'react-router';
import { Hash } from 'lucide-react';
import { useWorkspaceChannels } from '@/hooks/useWorkspaces';
import { ConversationView } from '@/components/chat/ConversationView';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { useTranslation } from 'react-i18next';

export function SpaceChannelPage() {
  const { workspaceId, channelId } = useParams();
  const wsId = Number(workspaceId);
  const { t } = useTranslation();

  const { data: channels, isLoading } = useWorkspaceChannels(wsId);
  const channel = channels?.find((c) => c.id === Number(channelId));

  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!channel || !channelId) {
    return (
      <EmptyState
        icon={Hash}
        title={t('workspaces.pages.channel.notFoundTitle')}
        description={t('workspaces.pages.channel.notFoundDesc')}
        className="mt-12"
      />
    );
  }

  return (
    <ConversationView
      conversationId={channelId}
      title={channel.name}
      headerIcon={<Hash className="size-4 text-muted-foreground" />}
    />
  );
}
