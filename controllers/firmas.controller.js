import {
  daoListarFirmasPorCliente,
  daoObtenerFirmaPorId,
  daoCrearFirma
} from "../dao/firmas.dao.js";

// GET /clientes/:id/firmas
export async function listarFirmasDeCliente(req, res) {
  try {
    const idCliente = Number(req.params.id);
    if (!Number.isInteger(idCliente) || idCliente <= 0) {
      return res.status(400).json({ error: "ID cliente inválido" });
    }

    const firmas = await daoListarFirmasPorCliente(idCliente);
    return res.json(firmas); // [] si no hay
  } catch (error) {
    console.error(error);
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
    console.error(error);
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

    // fecha opcional (si no viene, ponemos hoy YYYY-MM-DD)
    const fecha = fecha_firma ?? new Date().toISOString().slice(0, 10);

    // OJO: mando id_cliente (forma más habitual en DAO/SQL)
    const id_firma = await daoCrearFirma({
      id_cliente: idCliente,
      fecha_firma: fecha,
      imagen_firma
    });

    return res.status(201).json({ ok: true, id_firma });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error creando firma" });
  }
}
