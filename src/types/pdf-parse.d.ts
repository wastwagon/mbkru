declare module "pdf-parse" {
  import type { Buffer } from "node:buffer";

  function pdfParse(buffer: Buffer): Promise<{ text?: string; numpages?: number }>;
  export default pdfParse;
}

/** Same as `pdf-parse` default; avoids the package `index.js` (debug / side effects) in some runtimes. */
declare module "pdf-parse/lib/pdf-parse.js" {
  import type { Buffer } from "node:buffer";

  function pdfParse(buffer: Buffer): Promise<{ text?: string; numpages?: number }>;
  export default pdfParse;
}
