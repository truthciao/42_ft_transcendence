import { jest } from '@jest/globals';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const existsSyncMock = jest.fn<() => boolean>();
const unlinkSyncMock = jest.fn<() => void>();

jest.unstable_mockModule('fs', () => ({
  existsSync: existsSyncMock,
  unlinkSync: unlinkSyncMock,
}));

const { FilesService } = await import('./files.service.js');

describe('FilesService', () => {
  let service: InstanceType<typeof FilesService>;

  const prisma = {
    attachment: {
      create: jest.fn<() => Promise<any>>(),
      findUnique: jest.fn<() => Promise<any>>(),
      delete: jest.fn<() => Promise<any>>(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new FilesService(prisma as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException when file does not exist', async () => {
    prisma.attachment.findUnique.mockResolvedValue(null);

    await expect(service.deleteFile('missing-file-id', 1)).rejects.toThrow(
      NotFoundException,
    );

    expect(prisma.attachment.findUnique).toHaveBeenCalledWith({
      where: { id: 'missing-file-id' },
    });

    expect(prisma.attachment.delete).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user does not own the file', async () => {
    prisma.attachment.findUnique.mockResolvedValue({
      id: 'file-1',
      uploaderId: 2,
      fileUrl: '/uploads/attachments/file-1.pdf',
    });

    await expect(service.deleteFile('file-1', 1)).rejects.toThrow(
      ForbiddenException,
    );

    expect(prisma.attachment.findUnique).toHaveBeenCalledWith({
      where: { id: 'file-1' },
    });

    expect(prisma.attachment.delete).not.toHaveBeenCalled();
  });

  it('should delete the file record when user owns the file', async () => {
    prisma.attachment.findUnique.mockResolvedValue({
      id: 'file-1',
      uploaderId: 1,
      fileUrl: '/uploads/attachments/file-1.pdf',
    });

    prisma.attachment.delete.mockResolvedValue({
      id: 'file-1',
    });

    const result = await service.deleteFile('file-1', 1);

    expect(prisma.attachment.delete).toHaveBeenCalledWith({
      where: { id: 'file-1' },
    });

    expect(result).toEqual({
      message: 'FILE_DELETED_SUCCESSFULLY',
    });
  });

  it('should delete the physical file when it exists', async () => {
    prisma.attachment.findUnique.mockResolvedValue({
      id: 'file-1',
      uploaderId: 1,
      fileUrl: '/uploads/attachments/file-1.pdf',
    });

    existsSyncMock.mockReturnValue(true);

    await service.deleteFile('file-1', 1);

    expect(existsSyncMock).toHaveBeenCalled();
    expect(unlinkSyncMock).toHaveBeenCalled();

    expect(prisma.attachment.delete).toHaveBeenCalledWith({
      where: { id: 'file-1' },
    });
  });

  it('should delete the database record when physical file does not exist', async () => {
    prisma.attachment.findUnique.mockResolvedValue({
      id: 'file-1',
      uploaderId: 1,
      fileUrl: '/uploads/attachments/file-1.pdf',
    });

    existsSyncMock.mockReturnValue(false);

    await service.deleteFile('file-1', 1);

    expect(existsSyncMock).toHaveBeenCalled();

    expect(unlinkSyncMock).not.toHaveBeenCalled();

    expect(prisma.attachment.delete).toHaveBeenCalledWith({
      where: { id: 'file-1' },
    });
  });
  it('should save a normal attachment with attachments path', async () => {
    const file = {
      filename: 'stored-file.pdf',
      originalname: 'report.pdf',
      mimetype: 'application/pdf',
      size: 1234,
    } as Express.Multer.File;

    prisma.attachment.create.mockResolvedValue({
      id: 'file-1',
    });

    await service.saveFileRecord(1, file, 'chat');

    expect(prisma.attachment.create).toHaveBeenCalledWith({
      data: {
        uploader: {
          connect: { id: 1 },
        },
        fileName: 'report.pdf',
        fileUrl: '/uploads/attachments/stored-file.pdf',
        fileType: 'application/pdf',
        fileSize: 1234,
      },
    });
  });

  it('should save avatar file with avatars path', async () => {
    const file = {
      filename: 'avatar-123.png',
      originalname: 'me.png',
      mimetype: 'image/png',
      size: 2048,
    } as Express.Multer.File;

    prisma.attachment.create.mockResolvedValue({
      id: 'avatar-file-1',
    });

    await service.saveFileRecord(1, file, 'avatar');

    expect(prisma.attachment.create).toHaveBeenCalledWith({
      data: {
        uploader: {
          connect: { id: 1 },
        },
        fileName: 'me.png',
        fileUrl: '/uploads/avatars/avatar-123.png',
        fileType: 'image/png',
        fileSize: 2048,
      },
    });
  });
});