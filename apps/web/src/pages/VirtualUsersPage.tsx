import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTestUsers } from '../hooks/useTestUsers';

export function VirtualUsersPage() {
  const {
    data: users,
    isLoading,
    isError,
  } = useTestUsers();

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: users?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Failed to load users.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Virtual Scroll Test</h1>

      <p className="text-muted-foreground">
        {users?.length ?? 0} users
      </p>

      <div
        ref={parentRef}
        className="h-[600px] overflow-auto"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const user = users?.[virtualRow.index];

            if (!user) {
              return null;
            }

            return (
              <div
                key={user.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {user.username}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}