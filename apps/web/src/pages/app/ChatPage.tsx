import { NavLink, Outlet, useParams } from "react-router";

const conversations = [
  { id: "dm-1", name: "Ada Lovelace", preview: "See you later." },
  { id: "group-1", name: "Study Room", preview: "Planning tonight." },
];

export function ConversationListSidebar() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border p-4">
        <h2 className="text-sm font-semibold">Messages</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {conversations.map((conversation) => (
          <NavLink
            key={conversation.id}
            to={`/app/chat/${conversation.id}`}
            className="block rounded-lg px-3 py-2 text-sm hover:bg-accent"
          >
            <div className="font-medium">{conversation.name}</div>
            <div className="truncate text-xs text-muted-foreground">{conversation.preview}</div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export function ChatPage() {
  return <Outlet />;
}

export function ChatEmptyState() {
  return (
    <section className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Select a conversation
    </section>
  );
}

export function ConversationPage() {
  const { conversationId } = useParams();

  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="border-b border-border px-5 py-3">
        <h1 className="font-semibold">Conversation {conversationId}</h1>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-5 text-sm text-muted-foreground">
        Chat panel placeholder
      </div>
    </section>
  );
}
