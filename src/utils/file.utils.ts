export type FileCategory =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "archive"
  | "code"
  | "other";

export const getFileTypeFromExtension = (ext: string): FileCategory => {
  const cleaned = ext.toLowerCase().trim();

  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "svg", "ico", "heic"];
  const videoExts = ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv", "3gp", "mpeg"];
  const audioExts = ["mp3", "wav", "ogg", "flac", "aac", "m4a", "wma", "aiff"];
  const documentExts = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf", "odt", "ods", "odp"];
  const archiveExts = ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"];
  const codeExts = ["js", "ts", "jsx", "tsx", "html", "css", "json", "xml", "yml", "md", "sql", "py", "java", "c", "cpp", "cs", "rb", "php", "sh"];

  if (imageExts.includes(cleaned)) return "image";
  if (videoExts.includes(cleaned)) return "video";
  if (audioExts.includes(cleaned)) return "audio";
  if (documentExts.includes(cleaned)) return "document";
  if (archiveExts.includes(cleaned)) return "archive";
  if (codeExts.includes(cleaned)) return "code";

  return "other";
};

export const sanitizeFilename = (name: string): string => {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // elimina acentos
    .replace(/[^a-zA-Z0-9.\-_]/g, "_") // permite solo letras, números, puntos, guiones
    .replace(/_+/g, "_") // evita múltiples _
    .toLowerCase();
};
