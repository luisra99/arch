import supabase from "../../../libs/supabase";
import { AppError } from "../../../types/errors";


type SignedFile = { path: string; name: string; signedUrl: string; expiresIn: number };

async function isFile(objectPath: string, bucket: string) {
  const { error } = await supabase.storage.from(bucket).download(objectPath);
  return !error;
}

async function listPage(prefix: string, bucket: string, limit = 1000, offset = 0) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(prefix, { limit, offset, sortBy: { column: "name", order: "asc" } });
  if (error) throw new AppError(`Error listando "${prefix}": ${error.message}`, 500);
  return data ?? [];
}

async function listAllFiles(prefix: string, bucket: string): Promise<string[]> {
  const out: string[] = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const items = await listPage(prefix, bucket, pageSize, offset);
    if (items.length === 0) break;

    for (const entry of items) {
      const child = prefix ? `${prefix}/${entry.name}` : entry.name;
      const isFileByMeta = !!entry.metadata?.size || !!entry.metadata?.mimetype;

      if (isFileByMeta) {
        out.push(child);
      } else {
        const probe = await supabase.storage.from(bucket).list(child, { limit: 1 });
        if (!probe.error && (probe.data?.length ?? 0) > 0) {
          out.push(...(await listAllFiles(child, bucket)));
        } else {
          // Raro pero posible: archivo sin metadata
          out.push(child);
        }
      }
    }

    if (items.length < pageSize) break;
    offset += pageSize;
  }
  return out;
}

export async function listSignedUrlsService(path: string, expiresIn = 60): Promise<SignedFile[]> {
  const bucket = process.env.SUPABASE_BUCKET_NAME!;
  const clean = (path || "").replace(/^\/+|\/+$/g, "");
  if (!clean) throw new AppError("Falta el parámetro 'path'", 400);

  // Si es archivo: firma y devuelve uno
  if (await isFile(clean, bucket)) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrls([clean], expiresIn, { download: true });
    if (error) throw new AppError(`Error firmando: ${error.message}`, 500);
    return [{
      path: clean,
      name: clean.split("/").pop() || "file",
      signedUrl: data[0].signedUrl,
      expiresIn
    }];
  }

  // Es carpeta/prefijo: firma todos los archivos dentro (recursivo)
  const files = await listAllFiles(clean, bucket);
  if (files.length === 0) return [];

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(files, expiresIn, { download: true });
  if (error) throw new AppError(`Error firmando: ${error.message}`, 500);

  return data.map((d, i) => ({
    path: files[i],
    name: files[i].split("/").pop() || `file_${i + 1}`,
    signedUrl: d.signedUrl,
    expiresIn
  }));
}
