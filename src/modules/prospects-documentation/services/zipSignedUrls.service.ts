import archiver from "archiver";
import path from "node:path";
import { Readable } from "node:stream";

type SignedFile = { path: string; name: string; signedUrl: string };

/**
 * Crea un ZIP por streaming desde signedUrls.
 * - No guarda en disco; comprime “al vuelo”.
 * - Usa rutas relativas para mantener estructura dentro del ZIP.
 * - Tolera fallos por archivo (los omite) para no corromper el ZIP.
 */
export async function appendSignedFilesToArchive(
  archive: archiver.Archiver,
  files: SignedFile[],
  sourceRoot: string,
  zipRoot: string
) {
  const root = sourceRoot.replace(/^\/+|\/+$/g, "");

  for (const f of files) {
    try {
      const res = await fetch(f.signedUrl);
      if (!res.ok || !res.body) continue;

      // Node 18: convertir WebReadableStream -> Node Readable
      // @ts-ignore
      const nodeStream: Readable = typeof Readable.fromWeb === "function"
        // @ts-ignore
        ? Readable.fromWeb(res.body)
        : Readable.from(Buffer.from(await res.arrayBuffer()));

      // nombre relativo dentro del ZIP (conserva estructura)
      const rel = path.posix.relative(root, f.path) || f.name;
      archive.append(nodeStream, { name: `${zipRoot}/${rel}` });
    } catch {
      // omitir en caso de error de descarga
      continue;
    }
  }
}
