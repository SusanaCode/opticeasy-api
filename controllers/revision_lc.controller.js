import {
  daoListarRevisionesLcPorCliente,
  daoObtenerRevisionLcPorId,
  daoCrearRevisionLc,
  daoActualizarRevisionLc,
  daoBorrarRevisionLc
} from "../dao/revision_lc.dao.js";

/**
 * GET /clientes/:idCliente/revision-lc  (y también /clientes/:id/revisiones-lc)
 * Listar revisiones LC de un cliente
 */
export async function listarRevisionesLcPorCliente(req, res) {
  try {
    const idCliente = Number(req.params.idCliente ?? req.params.id);
    if (!Number.isInteger(idCliente) || idCliente <= 0) {
      return res.status(400).json({ error: "ID cliente inválido" });
    }

    const rows = await daoListarRevisionesLcPorCliente(idCliente);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error listando revisiones LC" });
  }
}

/**
 * GET /revision-lc/:id
 * Obtener una revisión LC por id
 */
export async function obtenerRevisionLcPorId(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID revisión inválido" });
    }

    const row = await daoObtenerRevisionLcPorId(id);
    if (!row) {
      return res.status(404).json({ error: "Revisión LC no encontrada" });
    }

    return res.json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error obteniendo revisión LC" });
  }
}

/**
 * POST /clientes/:idCliente/revision-lc (y también /clientes/:id/revisiones-lc)
 * Crear revisión LC para un cliente
 */
export async function crearRevisionLc(req, res) {
  try {
    const idCliente = Number(req.params.idCliente ?? req.params.id);
    if (!Number.isInteger(idCliente) || idCliente <= 0) {
      return res.status(400).json({ error: "ID cliente inválido" });
    }

    const payload = { ...req.body, id_cliente: idCliente };

    // Validar id_optometrista
    const idOpt = Number(payload.id_optometrista);
    if (!Number.isInteger(idOpt) || idOpt <= 0) {
      return res.status(400).json({ error: "id_optometrista inválido" });
    }
    payload.id_optometrista = idOpt;

    // Validar fecha_revision
    if (
      typeof payload.fecha_revision !== "string" ||
      payload.fecha_revision.length !== 10
    ) {
      return res
        .status(400)
        .json({ error: "fecha_revision inválida (formato YYYY-MM-DD)" });
    }

    const insertId = await daoCrearRevisionLc(payload);
    const created = await daoObtenerRevisionLcPorId(insertId);

    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error creando revisión LC" });
  }
}

/**
 * PUT /revision-lc/:id
 * Actualizar revisión LC (guardar cambios)
 */
export async function actualizarRevisionLc(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID revisión inválido" });
    }

    const body = req.body ?? {};

    // Validar fecha_revision si viene
    if (body.fecha_revision !== undefined) {
      if (
        typeof body.fecha_revision !== "string" ||
        body.fecha_revision.length !== 10
      ) {
        return res
          .status(400)
          .json({ error: "fecha_revision inválida (formato YYYY-MM-DD)" });
      }
    }

    // Validar id_optometrista si viene
    if (body.id_optometrista !== undefined) {
      const idOpt = Number(body.id_optometrista);
      if (!Number.isInteger(idOpt) || idOpt <= 0) {
        return res.status(400).json({ error: "id_optometrista inválido" });
      }
      body.id_optometrista = idOpt;
    }

    const affected = await daoActualizarRevisionLc(id, body);
    if (affected === 0) {
      return res.status(404).json({ error: "Revisión LC no encontrada" });
    }

    const updated = await daoObtenerRevisionLcPorId(id);
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error actualizando revisión LC" });
  }
}

/**
 * DELETE /revision-lc/:id
 * Borrar revisión LC
 */
export async function borrarRevisionLc(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID revisión inválido" });
    }

    const affected = await daoBorrarRevisionLc(id);
    if (affected === 0) {
      return res.status(404).json({ error: "Revisión LC no encontrada" });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error borrando revisión LC" });
  }
}

