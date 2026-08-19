import { useParams } from 'react-router';

export function SpaceChannelPage() {
  const { channelId } = useParams();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
      <p className="font-medium text-foreground">Channel #{channelId}</p>
      <p className="text-sm">Channel messaging lands in a future day (reuses the Chat module).</p>
    </div>
  );
}
