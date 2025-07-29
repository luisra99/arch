export function getMimeType(ext: string | undefined) {
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "pdf") return "application/pdf";
  if (ext === "mp4") return "video/mp4";
  return "application/octet-stream";
}