import { MessageCircle, Settings, Users, Waypoints } from "lucide-react";
import { NavLink } from "react-router";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/app/chat", label: "Messages", icon: MessageCircle },
  { to: "/app/friends", label: "Friends", icon: Users },
  { to: "/app/spaces", label: "Spaces", icon: Waypoints },
  { to: "/app/settings/profile", label: "Settings", icon: Settings },
]

// TODO(Day X): 替换成真实的 GET /workspaces 数据
const mockSpaces = [
  { id: '1', name: 'Acme Inc', color: 'bg-indigo-500' },
  { id: '2', name: 'Side Project', color: 'bg-orange-500' },
  { id: '3', name: 'Study Group', color: 'bg-emerald-500' },
];

function initials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function TabRail() {
  return (
    <nav className="flex min-h-0 flex-col items-center gap-3 overflow-y-auto border-r border-border bg-sidebar px-2 py-3">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          title={label}
          className={({ isActive }) =>
           cn(
            "flex size-11 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
           )
          }
        >
          <Icon className="size-5" />
          <span className="sr-only">{label}</span>
        </NavLink>
      ))}

      <div className="my-1 h-px w-8 bg-border" />

      {mockSpaces.map((space) => (
        <NavLink
          key={space.id}
          to={`/app/spaces${space.id}`}
          title={space.name}
          className="flex size-11 items-center justify-center rounded-full text-xs font-semibold text-white ring-offset-background transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className={cn("flex size-10 items-center justify-center rounded-full", space.color)}>
            {initials(space.name)}
          </span>
        </NavLink>
      ))}
    </nav>
  )
}
