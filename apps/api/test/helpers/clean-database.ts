import type { PrismaService } from '../../src/prisma/prisma.service.js';

export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();

  await prisma.attachment.deleteMany();

  await prisma.workspaceInvite.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();

  await prisma.friendship.deleteMany();

  await prisma.oAuthAccount.deleteMany();
  await prisma.profile.deleteMany();

  await prisma.user.deleteMany();
}
