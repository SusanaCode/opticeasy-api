import {
  daoListarRevisionesGafaPorCliente,
  daoObtenerRevisionGafaPorId,
  daoCrearRevisionGafa,
  daoActualizarRevisionGafa,
  daoBorrarRevisionGafa
} from "../dao/revision_gafa.dao.js";
import { esFechaIsoValida } from "../utils/date.js";

/**
 * GET /clientes/:id/revisiones-gafa
 * Listado (más nueva -> más antigua)
 */
export async function listarRevisionesGafaDeCliente(req, res) {
  try {
    const idCliente = Number(req.params.id);
    if (!Number.isInteger(idCliente) || idCliente <= 0) {
      return res.status(400).json({ error: "ID cliente inválido" });
    }

    const revisiones = await daoListarRevisionesGafaPorCliente(idCliente);
    return res.json(revisiones);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error listando revisiones de gafa" });
  }
}

/**
 * GET /revisiones-gafa/:id
 * Detalle completo de una revisión
 */
export async function obtenerRevisionGafa(req, res) {
  try {
    const idRevision = Number(req.params.id);
    if (!Number.isInteger(idRevision) || idRevision <= 0) {
      return res.status(400).json({ error: "ID revisión inválido" });
    }

    const revision = await daoObtenerRevisionGafaPorId(idRevision);
    if (!revision) {
      return res.status(404).json({ error: "Revisión no encontrada" });
    }

    return res.json(revision);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error obteniendo la revisión de gafa" });
  }
}

/**
 * POST /clientes/:id/revisiones-gafa
 * Crear revisión para un cliente
 *
 * IMPORTANTE:
 * - id_optometrista sale del usuario autenticado (JWT)
 * - NO se acepta desde el body
 */
export async function crearRevisionGafaParaCliente(req, res) {
  try {
    const idCliente = Number(req.params.id);
    if (!Number.isInteger(idCliente) || idCliente <= 0) {
      return res.status(400).json({ error: "ID cliente inválido" });
    }

    const body = req.body ?? {};

    // 🔐 id_optometrista sale del token
    const idOptometrista = Number(req.user?.id);
    if (!Number.isInteger(idOptometrista) || idOptometrista <= 0) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // fecha_revision es DATE (YYYY-MM-DD)
    const fechaRevision =
      body.fecha_revision ?? new Date().toISOString().slice(0, 10);

    if (!esFechaIsoValida(fechaRevision)) {
      return res
        .status(400)
        .json({ error: "fecha_revision inválida (formato YYYY-MM-DD)" });
    }

    const data = {
      ...body,
      id_cliente: idCliente,
      id_optometrista: idOptometrista,
      fecha_revision: fechaRevision
    };

    const idRevisionGafa = await daoCrearRevisionGafa(data);

    return res.status(201).json({
      ok: true,
      id_revision_gafa: idRevisionGafa
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error creando la revisión de gafa" });
  }
}

/**
 * PUT /revisiones-gafa/:id
 * Actualizar revisión (guardar cambios)
 */
export async function actualizarRevisionGafa(req, res) {
  try {
    const idRevision = Number(req.params.id);
    if (!Number.isInteger(idRevision) || idRevision <= 0) {
      return res.status(400).json({ error: "ID revisión inválido" });
    }

    const body = { ...(req.body ?? {}) };

    if (body.fecha_revision !== undefined) {
      if (!esFechaIsoValida(body.fecha_revision)) {
        return res
          .status(400)
          .json({ error: "fecha_revision inválida (formato YYYY-MM-DD)" });
      }
    }

    // 🔐 No permitir cambiar id_optometrista desde cliente
    if ("id_optometrista" in body) {
      delete body.id_optometrista;
    }

    const affected = await daoActualizarRevisionGafa(idRevision, body);

    if (affected === 0) {
      return res.status(404).json({ error: "Revisión no encontrada" });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error actualizando la revisión de gafa" });
  }
}

/**
 * DELETE /revisiones-gafa/:id
 * Borrar revisión (por error)
 */
export async function borrarRevisionGafa(req, res) {
  try {
    const idRevision = Number(req.params.id);
    if (!Number.isInteger(idRevision) || idRevision <= 0) {
      return res.status(400).json({ error: "ID revisión inválido" });
    }

    const affected = await daoBorrarRevisionGafa(idRevision);
    if (affected === 0) {
      return res.status(404).json({ error: "Revisión no encontrada" });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error borrando la revisión de gafa" });
  }
}

