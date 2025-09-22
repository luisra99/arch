// src/services/zip.service.ts
import { Readable } from "node:stream";
import { ZipWriter, BlobReader, WritableWriter, BlobWriter } from "@zip.js/zip.js";
import supabase from "../../../libs/supabase";
import { AppError } from "../../../types/errors";
import logger from "../../../libs/logger";



const BUCKET = process.env.SUPABASE_BUCKET_NAME!;

/** Quita / inicial o final */
function cleanPath(p?: string) {
    return (p || "").replace(/^\/+|\/+$/g, "");
}

/** ¿Es un archivo? Probamos un download rápido (HEAD no está en storage-js) */
async function isFile(fullPath: string): Promise<boolean> {
    const { data } = await supabase.storage.from(BUCKET).download(fullPath);
    return !!data; // si existe, es archivo
}

/** Lista recursiva de archivos bajo un prefijo */
async function listAllFilesRecursive(prefix: string): Promise<string[]> {
    const safe = cleanPath(prefix);
    const results: string[] = [];

    async function walk(dir: string) {

        // Supabase list: paginamos por offset para evitar sorpresas
        const PAGE = 1000;
        let offset = 0;
        while (true) {
            const { data, error } = await supabase.storage
                .from(BUCKET)
                .list(dir, { limit: PAGE, offset });
            if (error) throw new AppError(`Error listando "${dir}": ${error.message}`, 500);
            if (!data || data.length === 0) break;

            for (const entry of data) {
                if (entry.name === "." || entry.name === "..") continue;
                const entryPath = cleanPath([dir, entry.name].filter(Boolean).join("/"));
                if (entry.id) {
                    // Algunos drivers exponen id; nos apoyamos en entry.metadata
                }
                if (entry.metadata && entry.metadata.size >= 0) {
                    // Heurística: si tiene size, es archivo
                    results.push(entryPath);
                } else if (entry.name) {
                    // Supabase marca directorios cuando no hay size/metadata
                    logger.info("Invocar walk en "+entryPath );
                    await walk(entryPath);
                } else {
                    // Fallback: intentamos download para decidir
                    try {
                        const { data: blob } = await supabase.storage.from(BUCKET).download(entryPath);
                        if (blob) results.push(entryPath);
                    } catch {
                        await walk(entryPath);
                    }
                }
            }

            if (data.length < PAGE) break;
            offset += PAGE;
        }
    }

    await walk(safe);
    console.log(results);
    return results;
}

/** Convierte un Blob web stream a Readable de Node */
function nodeReadableFromBlob(blob: Blob): Readable {
    // blob.stream() devuelve ReadableStream<Web>, lo convertimos a Node
    const webStream = (blob as any).stream?.() ?? (blob as any).stream;
    if (!webStream || typeof webStream !== "function") {
        // fallback: leemos a ArrayBuffer
        return Readable.from((async function* () {
            const ab = await blob.arrayBuffer();
            yield Buffer.from(ab);
        })());
    }
    // @ts-ignore
    return Readable.fromWeb(blob.stream());
}

/**
 * Crea un stream de ZIP con la estructura de carpetas preservada.
 * Si `inputPath` es archivo: lo mete como único entry con su nombre base.
 * Si es carpeta: incluye todos los archivos recursivos con ruta relativa.
 */

export async function getFolderZipStreamService(inputPath: string, zipName?: string): Promise<Readable> {

  const safe = cleanPath(inputPath);
  if (!safe) throw new AppError("Falta el parámetro 'path'", 400);

  // --- CAMBIO 1: usar BlobWriter en lugar de TransformStream ---
  const zipBlobWriter = new BlobWriter("application/zip");
  const zipWriter = new ZipWriter(zipBlobWriter, {
    bufferedWrite: true,
  });

  const treatAsFile = await isFile(safe).catch(() => false);

  // Utilidad mínima para asegurar Blob
  const toBlob = (data: any) => {
    if (typeof Blob !== "undefined" && data instanceof Blob) return data as Blob;
    // En Node 18+ suele haber Response global; si falla, fallback simple:
    try { return new Response(data as any).blob(); } catch { return new Blob([data]); }
  };

  if (treatAsFile) {
    const { data, error } = await supabase.storage.from(BUCKET).download(safe);
    if (error || !data) throw new AppError(`No se pudo descargar el archivo: ${error?.message || "desconocido"}`, 404);

    const blob = await toBlob(data);
    const name = safe.split("/").pop() || "file";
    await zipWriter.add(name, new BlobReader(blob), {
      // CAMBIO 3: no uses async aquí
    });
  } else {
    const files = await listAllFilesRecursive(safe);
    if (files.length === 0) throw new AppError("La carpeta está vacía.", 404);

    for (const full of files) {
      const rel = full.startsWith(safe + "/") ? full.slice(safe.length + 1) : full;

      const { data, error } = await supabase.storage.from(BUCKET).download(full);
      if (error || !data) throw new AppError(`Error descargando "${full}": ${error?.message || "desconocido"}`, 500);

      const blob = await toBlob(data);

      await zipWriter.add(rel, new BlobReader(blob), {
      });
    }
  }

  // CAMBIO 4: cerrar y obtener el Blob final
  await zipWriter.close(undefined); // no pases null

  const zipBlob = await zipBlobWriter.getData();
  // Convertir a Readable de Node de forma simple
  const nodeReadable: Readable = Readable.fromWeb(zipBlob.stream() as any);
  return nodeReadable;
}
