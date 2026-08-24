import { createContext } from 'react';

export interface RealtimeContextValue {
  onlineUserIds: Set<number>;
}

export const RealtimeContext =
  createContext<RealtimeContextValue | null>(null);