import { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import {
  useFriends,
  useSentFriendRequests,
} from '../../hooks/useFriends';
import { useUserSearch } from '../../hooks/useUserSearch';
import { useSendFriendRequest } from '../../hooks/useFriendMutations';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { Button } from '@/components/ui/button';
import {
  addFriendSearchSchema,
  type AddFriendSearchValues,
} from '@repo/shared-types';

export function AddFriend() {
  const { t } = useTranslation();
  const form = useForm<AddFriendSearchValues>({
    resolver: zodResolver(addFriendSearchSchema),
    defaultValues: {
      username: '',
    },
  });
  const [sendingUserId, setSendingUserId] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const username = form.watch('username');
  
  const {
    data: searchResult,
    isLoading: isUsersLoading,
    isError: isUsersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserSearch(username);
  
  const { user: currentUser, loading: isCurrentUserLoading } = useAuth();
  
  const { data: friends } = useFriends();
  
  const sendFriendRequestMutation = useSendFriendRequest();
  
  const { data: sentRequests } = useSentFriendRequests();
  
  const users =
  searchResult?.pages.flatMap((page) => page.users) ?? [];
  
  const friendIds = new Set(
    friends?.map((friend) => friend.id) ?? [],
  );

  const pendingUserIds = new Set(
    sentRequests?.map((request) => request.addresseeId) ?? [],
  );

  const availableUsers =
    users?.filter((user) => {
      if (user.id === currentUser?.id) {
        return false;
      }

      if (friendIds.has(user.id)) {
        return false;
      }
      
      return true;
    }) ?? [];
    
    const rowVirtualizer = useVirtualizer({
      count: availableUsers.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 72,
      overscan: 5,
    });

  useEffect(() => {
    const element = loadMoreRef.current;
    
    if (!element || !hasNextPage) {
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      },
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);
  
  if (isCurrentUserLoading) {
    return <p>{t('friends.loading')}</p>;
  }

  const handleSendFriendRequest = (userId: number) => {
    setSendingUserId(userId);

    sendFriendRequestMutation.mutate(
      {
        addresseeId: userId,
      },
      {
        onSuccess: () => {
          toast.success(t('friends.addFriend.success'));
        },
        onError: () => {
          toast.error(t('friends.addFriend.error'));
        },
        onSettled: () => {
          setSendingUserId(null);
        },
      },
    );
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">
        {t('friends.addFriend.title')}
      </h2>

      <Input
        type="text"
        placeholder={t('friends.addFriend.searchPlaceholder')}
        {...form.register('username')}
      />

      {form.formState.errors.username ? (
        <p className="text-destructive">
          {t('friends.addFriend.minCharacters')}
        </p>
      ) : isUsersLoading ? (
        <p className="text-muted-foreground">
          {t('friends.addFriend.searching')}
        </p>
      ) : isUsersError ? (
        <p className="text-destructive">
          {t('friends.addFriend.searchError')}
        </p>
      ) : availableUsers.length === 0 ? (
        <p className="text-muted-foreground">
          {t('friends.addFriend.noUsers')}
        </p>
      ) : (
        <>
          <div
            ref={parentRef}
            className="h-64 overflow-y-auto"
          >
            <div
              className="relative w-full"
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const user = availableUsers[virtualRow.index];

                if (!user) {
                  return null;
                }

                const isSending = sendingUserId === user.id;
                const isPending = pendingUserIds.has(user.id);

                return (
                  <div
                    key={user.id}
                    className="
                      absolute
                      left-0
                      top-0
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-lg
                      border
                      p-4
                    "
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <p className="font-medium">
                      {user.username}
                    </p>
                    <Button
                      size="sm"
                      disabled={
                        isPending ||
                        (sendFriendRequestMutation.isPending && isSending)
                      }
                      onClick={() => handleSendFriendRequest(user.id)}
                    >
                      {isSending
                        ? t('friends.addFriend.sending')
                        : isPending
                          ? t('friends.addFriend.pending')
                          : t('friends.addFriend.button')}
                    </Button>
                  </div>
                );
              })}
            </div>

            {hasNextPage && (
              <div ref={loadMoreRef} className="h-1" />
            )}

            {isFetchingNextPage && (
              <p className="py-2 text-center text-sm text-muted-foreground">
                {t('friends.addFriend.searching')}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}