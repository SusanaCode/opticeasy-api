
import { pool } from "../config/db.js";

/**
 * LISTADO para pantalla (por cliente):
 * - orden: más nueva -> más antigua
 * - campos principales (según tabla): OD/OI (esf, cil, eje, add, av, tipo_lente, dominante)
 * - optometrista: nombre + apellidos (+ colegiado)
 */
export async function daoListarRevisionesLcPorCliente(idCliente) {
  const [rows] = await pool.query(
    `
    SELECT
      rl.id_revision_lc,
      rl.id_cliente,
      DATE_FORMAT(rl.fecha_revision, '%Y-%m-%d') AS fecha_revision,

      -- OD
      rl.esfera_od,
      rl.cilindro_od,
      rl.eje_od,
      rl.av_od,
      rl.add_od,
      rl.dominante_od,
      rl.tipo_lente_od,

      -- OI
      rl.esfera_oi,
      rl.cilindro_oi,
      rl.eje_oi,
      rl.av_oi,
      rl.add_oi,
      rl.dominante_oi,
      rl.tipo_lente_oi,

      -- Optometrista
      rl.id_optometrista,
      CONCAT(u.nombre_usuario, ' ', u.apellidos_usuario) AS optometrista,
      u.numero_colegiado AS optometrista_colegiado

    FROM revision_lc rl
    LEFT JOIN usuarios u ON u.id_usuario = rl.id_optometrista
    WHERE rl.id_cliente = ?
    ORDER BY rl.fecha_revision DESC, rl.id_revision_lc DESC
    `,
    [idCliente]
  );

  return rows;
}

/**
 * DETALLE: obtener una revisión completa por ID
 */
export async function daoObtenerRevisionLcPorId(idRevisionLc) {
  const [rows] = await pool.query(
    `
    SELECT
      rl.id_revision_lc,
      rl.id_cliente,
      rl.id_optometrista,
      DATE_FORMAT(rl.fecha_revision, '%Y-%m-%d') AS fecha_revision,

      rl.anamnesis,
      rl.otras_pruebas,

      -- OD
      rl.esfera_od,
      rl.cilindro_od,
      rl.eje_od,
      rl.av_od,
      rl.add_od,
      rl.dominante_od,
      rl.tipo_lente_od,

      -- OI
      rl.esfera_oi,
      rl.cilindro_oi,
      rl.eje_oi,
      rl.av_oi,
      rl.add_oi,
      rl.dominante_oi,
      rl.tipo_lente_oi,

      -- Optometrista (info “bonita” para mostrar)
      CONCAT(u.nombre_usuario, ' ', u.apellidos_usuario) AS optometrista,
      u.numero_colegiado AS optometrista_colegiado

    FROM revision_lc rl
    LEFT JOIN usuarios u ON u.id_usuario = rl.id_optometrista
    WHERE rl.id_revision_lc = ?
    LIMIT 1
    `,
    [idRevisionLc]
  );

  return rows[0] ?? null;
}


/**
 * CREAR revisión LC
 * Nota: fecha_revision es DATE -> enviar "YYYY-MM-DD"
 */
export async function daoCrearRevisionLc(data) {
  const {
    id_cliente,
    id_optometrista,
    fecha_revision,

    anamnesis = null,
    otras_pruebas = null,

    // OD
    esfera_od = null,
    cilindro_od = null,
    eje_od = null,
    av_od = null,
    add_od = null,
    dominante_od = 0,
    tipo_lente_od = null,

    // OI
    esfera_oi = null,
    cilindro_oi = null,
    eje_oi = null,
    av_oi = null,
    add_oi = null,
    dominante_oi = 0,
    tipo_lente_oi = null
  } = data;

  const [result] = await pool.query(
    `
    INSERT INTO revision_lc (
      id_cliente, id_optometrista, fecha_revision,
      anamnesis, otras_pruebas,

      esfera_od, cilindro_od, eje_od, av_od, add_od, dominante_od, tipo_lente_od,
      esfera_oi, cilindro_oi, eje_oi, av_oi, add_oi, dominante_oi, tipo_lente_oi
    )
    VALUES (
      ?, ?, ?,
      ?, ?,

      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?
    )
    `,
    [
      id_cliente, id_optometrista, fecha_revision,
      anamnesis, otras_pruebas,

      esfera_od, cilindro_od, eje_od, av_od, add_od, dominante_od, tipo_lente_od,
      esfera_oi, cilindro_oi, eje_oi, av_oi, add_oi, dominante_oi, tipo_lente_oi
    ]
  );

  return result.insertId;
}

/**
 * ACTUALIZAR revisión LC
 * (no cambia id_cliente, pero sí todo lo demás)
 */
export async function daoActualizarRevisionLc(idRevisionLc, data) {
  const {
    id_optometrista,
    fecha_revision,

    anamnesis = null,
    otras_pruebas = null,

    // OD
    esfera_od = null,
    cilindro_od = null,
    eje_od = null,
    av_od = null,
    add_od = null,
    dominante_od = 0,
    tipo_lente_od = null,

    // OI
    esfera_oi = null,
    cilindro_oi = null,
    eje_oi = null,
    av_oi = null,
    add_oi = null,
    dominante_oi = 0,
    tipo_lente_oi = null
  } = data;

  const [result] = await pool.query(
    `
    UPDATE revision_lc
    SET
      id_optometrista = ?,
      fecha_revision = ?,
      anamnesis = ?,
      otras_pruebas = ?,

      esfera_od = ?, cilindro_od = ?, eje_od = ?, av_od = ?, add_od = ?, dominante_od = ?, tipo_lente_od = ?,
      esfera_oi = ?, cilindro_oi = ?, eje_oi = ?, av_oi = ?, add_oi = ?, dominante_oi = ?, tipo_lente_oi = ?
    WHERE id_revision_lc = ?
    `,
    [
      id_optometrista,
      fecha_revision,
      anamnesis,
      otras_pruebas,

      esfera_od, cilindro_od, eje_od, av_od, add_od, dominante_od, tipo_lente_od,
      esfera_oi, cilindro_oi, eje_oi, av_oi, add_oi, dominante_oi, tipo_lente_oi,

      idRevisionLc
    ]
  );

  return result.affectedRows;
}

/**
 * BORRAR revisión LC (por error)
 */
export async function daoBorrarRevisionLc(idRevisionLc) {
  const [result] = await pool.query(
    `
    DELETE FROM revision_lc
    WHERE id_revision_lc = ?
    `,
    [idRevisionLc]
  );

  return result.affectedRows;
}
