import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { AuthenticatedSocket } from "../interfaces/authenticated-socket.interface";
import { WsAuthService } from "../services/ws-auth.service";

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly WsAuthService: WsAuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const client = ctx.switchToWs().getClient<AuthenticatedSocket>();

    if (client.data?.user) {
      return true;
    }

    client.data.user = await this.WsAuthService.authenticate(client);
    return true;
  }
}
