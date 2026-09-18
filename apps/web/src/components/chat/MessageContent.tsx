type MessageContentProps = {
  content: string;
  type?: string;
  apiBaseUri: string;
  downloadLabel: string;
};

export function MessageContent({
  content,
  type,
  apiBaseUri,
  downloadLabel,
}: MessageContentProps) {
  const isImageUrl =
    content.startsWith('/uploads/') &&
    /\.(jpeg|jpg|gif|png|webp)$/i.test(content);

  const isFileUrl = content.startsWith('/uploads/') && !isImageUrl;

  const renderType =
    type === 'image' || isImageUrl
      ? 'image'
      : type === 'file' || isFileUrl
        ? 'file'
        : 'text';

  // /uploads/ 路径由 nginx 直接代理到 API，不需要加 /api 前缀
  const resolveUrl = (path: string) =>
    path.startsWith('/uploads/') ? path : `${apiBaseUri}${path}`;

  if (renderType === 'image') {
    return (
      <img
        src={resolveUrl(content)}
        alt="attachment"
        className="max-w-full rounded-md cursor-pointer hover:opacity-90"
      />
    );
  }

  if (renderType === 'file') {
    return (
      <a
        href={resolveUrl(content)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 underline underline-offset-2"
      >
        📎 {downloadLabel}
      </a>
    );
  }

  return <>{content}</>;
}
