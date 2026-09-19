import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddFriend } from '../../components/friends/AddFriend';
import { FriendRequests } from '../../components/friends/FriendRequests';
import { Button } from '@/components/ui/button';

export function FriendsPage() {
  const { t } = useTranslation();
  const [showAddFriend, setShowAddFriend] = useState(false);

  return (
    <div className="space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{t('friends.title')}</h1>

        <p className="text-muted-foreground">
          {t('friends.description')}
        </p>

        <Button onClick={() => setShowAddFriend((prev) => !prev)}>
          {showAddFriend
            ? t('friends.close')
            : t('friends.addFriend.title')}
        </Button>
      </header>

      {showAddFriend && <AddFriend />}

      <FriendRequests />
    </div>
  );
}
