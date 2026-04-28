// pages/api/proxy-pdf.ts
// Proxies a PDF from the backend so el iframe lo carga desde el mismo origen
// del frontend, evitando bloqueos por X-Frame-Options / CORS de Railway.
import type { NextApiRequest, NextApiResponse } from "next";

const ALLOWED_BASE =
  (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/api\/?$/, "");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url param" });
  }

  // Solo permite URLs del propio backend para evitar open-proxy
  if (!url.startsWith(ALLOWED_BASE)) {
    return res.status(403).json({ error: "URL no permitida" });
  }

  try {
    const upstream = await fetch(url);

    if (!upstream.ok) {
      return res
        .status(upstream.status)
        .json({ error: "Error al obtener el documento" });
    }

    const buffer = await upstream.arrayBuffer();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    // Permite embeber desde el mismo origen
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.send(Buffer.from(buffer));
  } catch {
    res.status(500).json({ error: "Error al proxear el documento" });
  }
}
