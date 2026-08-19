import type { ComponentProps, MouseEvent } from "react";
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from "@/lib/utils";

interface PermissionButtonProps extends ComponentProps<typeof Button> {
  allowed: boolean;
  reason?: string;
}

export function PermissionButton({
  allowed,
  reason,
  className,
  onClick,
  tabIndex,
  children,
  ...props
}: PermissionButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!allowed) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  const button = (
    <Button
      {...props}
      aria-disabled={!allowed}
      tabIndex={!allowed? -1 : tabIndex}
      className={cn(!allowed && 'pointer-events-none opacity-50', className)}
      onClick={handleClick}
    >
      {children}
    </Button>
  );

  if (allowed || !reason) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" tabIndex={0} />}>
        {button}
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  );
}
