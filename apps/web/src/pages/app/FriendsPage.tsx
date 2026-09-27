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

        <div className="p-3">
          <FriendRequests />
        </div>
      </div>

      <div className="hidden h-full items-center justify-center md:flex">
        <p className="text-sm text-muted-foreground">
          {t('friends.selectFriend')}
        </p>
      </div>
    </div>
  );
}
