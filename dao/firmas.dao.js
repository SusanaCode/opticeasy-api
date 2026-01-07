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

// CREA FIRMA + MARCA CLIENTE COMO RGPD FIRMADO
export async function daoCrearFirmaYMarcarClienteFirmado({
  id_cliente,
  fecha_firma,
  imagen_firma
}) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Insertar firma
    const [result] = await conn.query(
      `
      INSERT INTO firma_rgpd (id_cliente, fecha_firma, imagen_firma)
      VALUES (?, ?, ?)
      `,
      [id_cliente, fecha_firma, imagen_firma]
    );

    const id_firma = result.insertId;

    // 2️⃣ Marcar cliente como RGPD firmado
    await conn.query(
      `
      UPDATE clientes
      SET firma_rgpd = 1
      WHERE id_cliente = ?
      `,
      [id_cliente]
    );

    await conn.commit();
    return id_firma;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
