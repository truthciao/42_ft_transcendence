import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { WorkspaceMember } from "src/generated/prisma/client";

export const CurrentMembership = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): WorkspaceMember => {
    const req = ctx.switchToHttp().getRequest();
    return req.workspaceMembership;
  }
)
