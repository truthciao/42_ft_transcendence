import { useTranslation } from 'react-i18next';
import { FriendRequests } from '../../components/friends/FriendRequests';
import { AddFriend } from '../../components/friends/AddFriend';
import { FriendsList } from '../../components/friends/FriendsList';

export function FriendsPage() {
  const { t } = useTranslation();

  return (
    <div className="md:space-y-8 md:p-6">
      <div className="md:hidden">
        <div className="sticky top-0 z-10 bg-background p-3">
          <AddFriend />
        </div>

        <FriendsList />
        <FriendRequests />
      </div>

      <div className="hidden md:block">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">{t('friends.title')}</h1>

          <p className="text-muted-foreground">
            {t('friends.description')}
          </p>
        </header>

        <FriendRequests />
      </div>
    </div>
  );
}
