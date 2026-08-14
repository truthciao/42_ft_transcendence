import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUserSearch } from '../../hooks/useUserSearch';

export function AddFriendDialog() {
  const [username, setUsername] = useState('');

  const {
    data: users = [],
    isLoading,
    isError,
  } = useUserSearch(username);

  return (
    <Dialog>
      <DialogTrigger render={<Button>Add Friend</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search by username"
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
          }}
        />

        {isLoading && <p>Searching...</p>}

        {isError && <p>Failed to search users.</p>}

        {!isLoading &&
          username.trim().length >= 2 &&
          users.length === 0 && (
            <p>No users found.</p>
          )}

        <div>
          {users.map((user) => (
            <div key={user.id}>
              <span>{user.username}</span>
              <Button>Add Friend</Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}