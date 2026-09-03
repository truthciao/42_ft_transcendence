import { useFriends } from '../../hooks/useFriends';
import { useTranslation } from 'react-i18next';

export function FriendsSidebar() {
  const { data: friends, isLoading, isError } = useFriends();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="p-4 text-muted-foreground">{t('friends.loading')}</div>
    );
  }

  if (isError) {
    return <div className="p-4 text-destructive">{t('friends.loadError')}</div>;
  }

  return (
    <aside className="p-4">
      <h3 className="mb-4 font-semibold">{t('friends.title')}</h3>

      {(!friends || friends.length === 0) && (
        <p className="text-sm text-muted-foreground">{t('friends.empty')}</p>
      )}

      <div className="space-y-2">
        {friends?.map((friend) => (
          <div
            key={friend.id}
            className="
              cursor-pointer
              rounded
              p-2
              hover:bg-muted
            "
          >
            {friend.username}
          </div>
        ))}
      </div>
    </aside>
  );
}
