import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddFriend } from '../../components/friends/AddFriend';
import { FriendList } from '../../components/friends/FriendList';
import { FriendRequests } from '../../components/friends/FriendRequests';
import { Button } from '@/components/ui/button';

export function FriendsPage() {
  const { t } = useTranslation();
  const [showAddFriend, setShowAddFriend] = useState(false);

  return (
    <div className="p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{t('friends.title')}</h1>

        <p className="text-muted-foreground">
          {t('friends.description')}
        </p>

        <Button onClick={() => setShowAddFriend((prev) => !prev)}>
          {showAddFriend ? t('friends.close') : t('friends.addFriend.title')}
        </Button>
      </header>

      {showAddFriend && <AddFriend />}

      <FriendRequests />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('friends.yourFriends')}</h2>

        <FriendList />
      </section>
    </div>
  );
}
