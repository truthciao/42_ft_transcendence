// import { useState, type FormEvent } from "react";
// import { useParams, useNavigate } from "react-router";
// import { Hash, Plus } from 'lucide-react';
// import { useWorkspace, useWorkspaceChannels } from "@/hooks/useWorkspaces";
// import { useCreateChannel } from "@/hooks/useWorkspaceMutations";
// import { usePermission } from "@/hooks/usePermission";
// import { PermissionButton } from "@/components/workspaces/PermissionButton";
// import { PermissionGate } from "@/components/workspaces/PermissionGate";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";

// export function SpaceDetailPage() {
//   const { workspaceId } = useParams();
//   const id = Number(workspaceId);
//   const navigate = useNavigate();

//   const { data: workspace, isLoading } = useWorkspace(id);
//   const { data: channels, isLoading: channelsLoading } = useWorkspaceChannels(id);
//   const { can } = usePermission(id);
//   const [createChannelOpen, setCreateChannelOpen] = useState(false);

//   if (isLoading) {
//     return (
//       <div className="space-y-4 p-6">
//         <Skeleton className="h-8 w-1/3" />
//         <Skeleton className="h-24 w-full" />
//       </div>
//     );
//   }

//   return (
//     <div className="h-full overflow-y-auto p-6">
//       <header className="mb"
//     </div>
//   )
// }
