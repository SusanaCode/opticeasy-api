import {
  daoListarFirmasPorCliente,
  daoObtenerFirmaPorId,
  daoUpsertFirmaYMarcarClienteFirmado
} from "../dao/firmas.dao.js";

const MAX_FIRMA_BYTES = 500 * 1024; // 500 KB
const FIRMA_DATA_URL_REGEX = /^data:image\/(png|jpeg|jpg);base64,([A-Za-z0-9+/=]+)$/;

// GET /clientes/:id/firmas
export async function listarFirmasDeCliente(req, res) {
  try {
    const idCliente = Number(req.params.id);
    if (!Number.isInteger(idCliente) || idCliente <= 0) {
      return res.status(400).json({ error: "ID cliente inválido" });
    }

    const firmas = await daoListarFirmasPorCliente(idCliente);
    return res.json(firmas);
  } catch (error) {
    console.error("[firmas] Error listando firmas:", error);
    return res.status(500).json({ error: "Error listando firmas" });
  }
}

// GET /firmas/:id
export async function obtenerFirma(req, res) {
  try {
    const idFirma = Number(req.params.id);
    if (!Number.isInteger(idFirma) || idFirma <= 0) {
      return res.status(400).json({ error: "ID firma inválido" });
    }

    const firma = await daoObtenerFirmaPorId(idFirma);
    if (!firma) {
      return res.status(404).json({ error: "Firma no encontrada" });
    }

    return res.json(firma);
  } catch (error) {
    console.error("[firmas] Error obteniendo firma:", error);
    return res.status(500).json({ error: "Error obteniendo firma" });
  }
}

// POST /clientes/:id/firmas
export async function crearFirmaParaCliente(req, res) {
  try {
    const idCliente = Number(req.params.id);
    if (!Number.isInteger(idCliente) || idCliente <= 0) {
      return res.status(400).json({ error: "ID cliente inválido" });
    }

    const { fecha_firma, imagen_firma } = req.body ?? {};

    if (!imagen_firma) {
      return res.status(400).json({ error: "imagen_firma es obligatoria" });
    }

    if (typeof imagen_firma !== "string") {
      return res.status(400).json({ error: "imagen_firma debe ser un string base64" });
    }

    const match = imagen_firma.match(FIRMA_DATA_URL_REGEX);
    if (!match) {
      return res.status(400).json({
        error: "Formato de imagen inválido. Solo se admite PNG o JPEG en base64"
      });
    }

    const base64Content = match[2];

    let imageBuffer;
    try {
      imageBuffer = Buffer.from(base64Content, "base64");
    } catch {
      return res.status(400).json({ error: "imagen_firma no es un base64 válido" });
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      return res.status(400).json({ error: "imagen_firma no es válida" });
    }

    if (imageBuffer.length > MAX_FIRMA_BYTES) {
      return res.status(413).json({
        error: "La imagen de la firma es demasiado grande (máximo 500 KB)"
      });
    }

    const fecha = fecha_firma ?? new Date().toISOString().slice(0, 10);

    if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({
        error: "fecha_firma inválida (formato YYYY-MM-DD)"
      });
    }

    await daoUpsertFirmaYMarcarClienteFirmado({
      id_cliente: idCliente,
      fecha_firma: fecha,
      imagen_firma
    });

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error("[firmas] Error creando firma:", error);
    return res.status(500).json({ error: "Error creando firma" });
  }
}