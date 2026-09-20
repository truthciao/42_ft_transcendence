# Frontend Conventions

## TanStack Query `queryKey`

We use hierarchical query keys for TanStack Query.

### Naming convention

Use the following structure:

```ts
[resource, ...identifiers, sub-resource]
```

Examples:

```ts
['friends', 'list']
['friends', 'requests']

['workspace', workspaceId]
['workspace', workspaceId, 'members']
['workspace', workspaceId, 'channels']
['workspace', workspaceId, 'invites']

['notifications']
['notifications', 'unread-count']

['users']
['users', 'search', username]
```

The resource should come first, followed by the resource ID when applicable, then a more specific sub-resource.

For example:

```ts
['workspace', workspaceId, 'members']
```

represents the members of a specific workspace.

### Query key factories

When a resource has multiple related queries, prefer a query key factory instead of repeating query key arrays throughout the code.

Example:

```ts
export const workspaceKeys = {
  all: ['workspaces'] as const,
  detail: (id: number) => ['workspace', id] as const,
  members: (id: number) => ['workspace', id, 'members'] as const,
  channels: (id: number) => ['workspace', id, 'channels'] as const,
  invites: (id: number) => ['workspace', id, 'invites'] as const,
};
```

Use the factory consistently:

```ts
useQuery({
  queryKey: workspaceKeys.members(workspaceId),
  queryFn: () => getWorkspaceMembers(workspaceId),
});
```

### Rules

* Use descriptive, lowercase resource names.
* Keep related queries under the same resource prefix.
* Put resource IDs immediately after the resource name.
* Put sub-resources after the resource ID.
* Use consistent names for the same resource.
* Prefer query key factories for resources with multiple related queries.
* Use the same query key when invalidating or removing the corresponding query.
