import { pool } from "../config/db.js";

// Lista firmas de un cliente (sin imagen para que sea ligero)
export async function daoListarFirmasPorCliente(idCliente) {
  const [rows] = await pool.query(
    `
    SELECT 
    id_firma, 
    id_cliente, 
    DATE_FORMAT(fecha_firma, '%Y-%m-%d') AS fecha_firma
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
    SELECT 
    id_firma, 
    id_cliente, 
    DATE_FORMAT(fecha_firma, '%Y-%m-%d') AS fecha_firma,
    imagen_firma
    FROM firma_rgpd
    WHERE id_firma = ?
    LIMIT 1
    `,
    [idFirma]
  );
  return rows[0] ?? null;
}

// Crea o actualiza firma + marca cliente firmado (transacción)
export async function daoUpsertFirmaYMarcarClienteFirmado({
  id_cliente,
  fecha_firma,
  imagen_firma
}) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1) INSERT o UPDATE (si ya existe por id_cliente UNIQUE)
    await conn.query(
      `
      INSERT INTO firma_rgpd (id_cliente, fecha_firma, imagen_firma)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        fecha_firma = VALUES(fecha_firma),
        imagen_firma = VALUES(imagen_firma)
      `,
      [id_cliente, fecha_firma, imagen_firma]
    );

    // 2) Marcar cliente firmado
    await conn.query(
      `
      UPDATE clientes
      SET firma_rgpd = 1
      WHERE id_cliente = ?
      `,
      [id_cliente]
    );

    await conn.commit();
    return true;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
