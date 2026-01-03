import { pool } from "../config/db.js";

// Lista firmas de un cliente (sin imagen para que sea ligero)
export async function daoListarFirmasPorCliente(idCliente) {
  const [rows] = await pool.query(
    `
    SELECT id_firma, id_cliente, fecha_firma
    FROM firma_rgpd
    WHERE id_cliente = ?
    ORDER BY fecha_firma DESC, id_firma DESC
    `,
    [idCliente]
  );
  return rows;
}

// Obtiene una firma por id (incluye imagen)
export async function daoObtenerFirmaPorId(idFirma) {
  const [rows] = await pool.query(
    `
    SELECT id_firma, id_cliente, fecha_firma, imagen_firma
    FROM firma_rgpd
    WHERE id_firma = ?
    `,
    [idFirma]
  );
  return rows[0] ?? null;
}

// Crea firma para un cliente
export async function daoCrearFirma({ idCliente, fecha_firma, imagen_firma }) {
  const [result] = await pool.query(
    `
    INSERT INTO firma_rgpd (id_cliente, fecha_firma, imagen_firma)
    VALUES (?, ?, ?)
    `,
    [idCliente, fecha_firma, imagen_firma]
  );
  return result.insertId;
}
