import { pool } from "../config/db.js";

/**
 * LISTADO para pantalla (por cliente):
 * - orden: más nueva -> más antigua
 * - campos principales: OD/OI (esf, cil, eje, add)
 * - optometrista: nombre + apellidos (+ colegiado)
 */
export async function daoListarRevisionesGafaPorCliente(idCliente) {
  const [rows] = await pool.query(
    `
    SELECT
      rg.id_revision_gafa,
      rg.id_cliente,
      rg.fecha_revision,

      -- OD (resultante)
      rg.esfera_od,
      rg.cilindro_od,
      rg.eje_od,
      rg.add_od,

      -- OI (resultante)
      rg.esfera_oi,
      rg.cilindro_oi,
      rg.eje_oi,
      rg.add_oi,

      -- Optometrista
      rg.id_optometrista,
      CONCAT(u.nombre_usuario, ' ', u.apellidos_usuario) AS optometrista,
      u.numero_colegiado AS optometrista_colegiado

    FROM revision_gafa rg
    LEFT JOIN usuarios u ON u.id_usuario = rg.id_optometrista
    WHERE rg.id_cliente = ?
    ORDER BY rg.fecha_revision DESC, rg.id_revision_gafa DESC
    `,
    [idCliente]
  );

  return rows;
}

/**
 * DETALLE: obtener una revisión completa por ID
 */
export async function daoObtenerRevisionGafaPorId(idRevisionGafa) {
  const [rows] = await pool.query(
    `
    SELECT
      rg.*,
      CONCAT(u.nombre_usuario, ' ', u.apellidos_usuario) AS optometrista,
      u.numero_colegiado AS optometrista_colegiado
    FROM revision_gafa rg
    LEFT JOIN usuarios u ON u.id_usuario = rg.id_optometrista
    WHERE rg.id_revision_gafa = ?
    LIMIT 1
    `,
    [idRevisionGafa]
  );

  return rows[0] ?? null;
}

/**
 * CREAR revisión
 * Nota: fecha_revision es DATE -> enviar "YYYY-MM-DD"
 */
export async function daoCrearRevisionGafa(data) {
  const {
    id_cliente,
    id_optometrista,
    fecha_revision,
    anamnesis = null,
    otras_pruebas = null,

    // Usada OD
    esfera_usada_od = null,
    cilindro_usada_od = null,
    eje_usada_od = null,
    av_usada_od = null,

    // Resultante OD
    esfera_od = null,
    cilindro_od = null,
    eje_od = null,
    av_od = null,
    add_od = null,
    prisma_od = null,
    ccf_od = null,
    arn_od = null,
    arp_od = null,
    dominante_od = 0,

    // Usada OI
    esfera_usada_oi = null,
    cilindro_usada_oi = null,
    eje_usada_oi = null,
    av_usada_oi = null,

    // Resultante OI
    esfera_oi = null,
    cilindro_oi = null,
    eje_oi = null,
    av_oi = null,
    add_oi = null,
    prisma_oi = null,
    ccf_oi = null,
    arn_oi = null,
    arp_oi = null,
    dominante_oi = 0
  } = data;

  const [result] = await pool.query(
    `
    INSERT INTO revision_gafa (
      id_cliente, id_optometrista, fecha_revision, anamnesis, otras_pruebas,

      esfera_usada_od, cilindro_usada_od, eje_usada_od, av_usada_od,
      esfera_od, cilindro_od, eje_od, av_od, add_od, prisma_od,
      ccf_od, arn_od, arp_od, dominante_od,

      esfera_usada_oi, cilindro_usada_oi, eje_usada_oi, av_usada_oi,
      esfera_oi, cilindro_oi, eje_oi, av_oi, add_oi, prisma_oi,
      ccf_oi, arn_oi, arp_oi, dominante_oi
    )
    VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?
    )
    `,
    [
      id_cliente, id_optometrista, fecha_revision, anamnesis, otras_pruebas,

      esfera_usada_od, cilindro_usada_od, eje_usada_od, av_usada_od,
      esfera_od, cilindro_od, eje_od, av_od, add_od, prisma_od,
      ccf_od, arn_od, arp_od, dominante_od,

      esfera_usada_oi, cilindro_usada_oi, eje_usada_oi, av_usada_oi,
      esfera_oi, cilindro_oi, eje_oi, av_oi, add_oi, prisma_oi,
      ccf_oi, arn_oi, arp_oi, dominante_oi
    ]
  );

  return result.insertId;
}

/**
 * ACTUALIZAR revisión
 * (no cambia id_cliente, pero sí todo lo demás)
 */
export async function daoActualizarRevisionGafa(idRevisionGafa, data) {
  const {
    id_optometrista,
    fecha_revision,
    anamnesis = null,
    otras_pruebas = null,

    esfera_usada_od = null,
    cilindro_usada_od = null,
    eje_usada_od = null,
    av_usada_od = null,

    esfera_od = null,
    cilindro_od = null,
    eje_od = null,
    av_od = null,
    add_od = null,
    prisma_od = null,
    ccf_od = null,
    arn_od = null,
    arp_od = null,
    dominante_od = 0,

    esfera_usada_oi = null,
    cilindro_usada_oi = null,
    eje_usada_oi = null,
    av_usada_oi = null,

    esfera_oi = null,
    cilindro_oi = null,
    eje_oi = null,
    av_oi = null,
    add_oi = null,
    prisma_oi = null,
    ccf_oi = null,
    arn_oi = null,
    arp_oi = null,
    dominante_oi = 0
  } = data;

  const [result] = await pool.query(
    `
    UPDATE revision_gafa
    SET
      id_optometrista = ?,
      fecha_revision = ?,
      anamnesis = ?,
      otras_pruebas = ?,

      esfera_usada_od = ?, cilindro_usada_od = ?, eje_usada_od = ?, av_usada_od = ?,
      esfera_od = ?, cilindro_od = ?, eje_od = ?, av_od = ?, add_od = ?, prisma_od = ?,
      ccf_od = ?, arn_od = ?, arp_od = ?, dominante_od = ?,

      esfera_usada_oi = ?, cilindro_usada_oi = ?, eje_usada_oi = ?, av_usada_oi = ?,
      esfera_oi = ?, cilindro_oi = ?, eje_oi = ?, av_oi = ?, add_oi = ?, prisma_oi = ?,
      ccf_oi = ?, arn_oi = ?, arp_oi = ?, dominante_oi = ?
    WHERE id_revision_gafa = ?
    `,
    [
      id_optometrista, fecha_revision, anamnesis, otras_pruebas,

      esfera_usada_od, cilindro_usada_od, eje_usada_od, av_usada_od,
      esfera_od, cilindro_od, eje_od, av_od, add_od, prisma_od,
      ccf_od, arn_od, arp_od, dominante_od,

      esfera_usada_oi, cilindro_usada_oi, eje_usada_oi, av_usada_oi,
      esfera_oi, cilindro_oi, eje_oi, av_oi, add_oi, prisma_oi,
      ccf_oi, arn_oi, arp_oi, dominante_oi,

      idRevisionGafa
    ]
  );

  return result.affectedRows; // 1 si actualiza, 0 si no existe
}

/**
 * BORRAR revisión (por error)
 */
export async function daoBorrarRevisionGafa(idRevisionGafa) {
  const [result] = await pool.query(
    `
    DELETE FROM revision_gafa
    WHERE id_revision_gafa = ?
    `,
    [idRevisionGafa]
  );

  return result.affectedRows; // 1 borrado, 0 no existe
}