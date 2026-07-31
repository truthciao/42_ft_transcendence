import { SocketRegistryService } from './ws-registry.service';

describe('SocketRegistryService', () => {
  let service: SocketRegistryService;

  beforeEach(() => {
    service = new SocketRegistryService();
  });

  it('registers a socket for a user and reports them online', () => {
    service.registerSocket(1, 'socket-a');

    expect(service.isUserOnline(1)).toBe(true);
    expect(service.getSocketIds(1)).toEqual(['socket-a']);
    expect(service.getUserId('socket-a')).toBe(1);
  });

  it('supports multiple sockets for the same user (multi-device)', () => {
    service.registerSocket(1, 'socket-a');
    service.registerSocket(1, 'socket-b');

    expect(service.getSocketIds(1).sort()).toEqual(['socket-a', 'socket-b']);
    expect(service.getOnlineUserIds()).toEqual([1]);
  });

  it('marks a user offline once all of their sockets disconnect', () => {
    service.registerSocket(1, 'socket-a');
    service.registerSocket(1, 'socket-b');

    service.unregisterSocket('socket-a');
    expect(service.isUserOnline(1)).toBe(true);

    service.unregisterSocket('socket-b');
    expect(service.isUserOnline(1)).toBe(false);
    expect(service.getOnlineUserIds()).toEqual([]);
  });

  it('does nothing when unregistering an unknown socket', () => {
    expect(() => service.unregisterSocket('unknown')).not.toThrow();
  });
});
