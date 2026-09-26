import { useTranslation } from 'react-i18next';
import { FriendRequests } from '../../components/friends/FriendRequests';
import { AddFriend } from '../../components/friends/AddFriend';
import { FriendsList } from '../../components/friends/FriendsList';

export function FriendsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 p-6">
      <div className="md:hidden space-y-4">
        <AddFriend />
        <FriendsList />
      </div>

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{t('friends.title')}</h1>

        <p className="text-muted-foreground">
          {t('friends.description')}
        </p>
      </header>

      <FriendRequests />
    </div>
  );
}
