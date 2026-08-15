import { createZodDto } from "nestjs-zod";
import { createWorkspaceSchema } from "@repo/shared-types";

export class CreateWorkspaceDto extends createZodDto(createWorkspaceSchema) {}
