import { createZodDto } from "nestjs-zod";
import { updateWorkspaceSchema } from "@repo/shared-types";

export class UpdateWorkspaceDto extends createZodDto(updateWorkspaceSchema) {}
