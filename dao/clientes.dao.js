

import { pool } from "../config/db.js";

// ✅ LISTADO general (si lo usas)
export async function daoListarClientes() {
  const [rows] = await pool.query(`
    SELECT id_cliente, nombre, apellidos, telefono, dni, activo
    FROM clientes
    WHERE activo = 1 
    ORDER BY id_cliente DESC
    LIMIT 100
  `);
  return rows;
}

// ✅ DETALLE completo para la pantalla de “ficha cliente”
export async function daoObtenerClientePorId(id) {
  const [rows] = await pool.query(
    `
    SELECT 
      id_cliente,
      nombre,
      apellidos,
      telefono,
      direccion,
      cp,
      poblacion,
      provincia,
      fecha_nacimiento,
      dni,
      correo_electronico,
      firma_rgpd,
      activo
    FROM clientes
    WHERE id_cliente = ?
    `,
    [id]
  );

  return rows[0] ?? null;
}


// BUSCAR LISTADO 
export async function daoBuscarClientes({ nombre, apellidos, dni, telefono }) {
  let sql = `
    SELECT id_cliente, nombre, apellidos, telefono, dni, activo
    FROM clientes
    WHERE activo = 1
  `;
  const params = [];

  if (nombre) {
    sql += " AND nombre LIKE ?";
    params.push(`%${nombre}%`);
  }

  if (apellidos) {
    sql += " AND apellidos LIKE ?";
    params.push(`%${apellidos}%`);
  }

  if (dni) {
    sql += " AND dni LIKE ?";         
    params.push(`%${dni}%`);
  }

  if (telefono) {
    sql += " AND telefono LIKE ?";   
    params.push(`%${telefono}%`);
  }

  sql += " ORDER BY apellidos, nombre LIMIT 50";

  const [rows] = await pool.query(sql, params);
  return rows;
}


export async function daoCrearCliente({
  nombre,
  apellidos,
  telefono,
  direccion,
  cp,
  poblacion,
  provincia,
  fecha_nacimiento,
  dni,
  correo_electronico,
  firma_rgpd,
  activo
}) {
  const [result] = await pool.query(
    `
    INSERT INTO clientes
    (nombre, apellidos, telefono, direccion, cp, poblacion, provincia, fecha_nacimiento,
     dni, correo_electronico, firma_rgpd, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      nombre,
      apellidos,
      telefono ?? null,
      direccion ?? null,
      cp ?? null,
      poblacion ?? null,
      provincia ?? null,
      fecha_nacimiento ?? null,
      dni,
      correo_electronico ?? null,
      firma_rgpd ?? 0,
      activo ?? 1
    ]
  );
  return result.insertId;
}



export async function daoActualizarCliente(id, data) {
  const {
    nombre,
    apellidos,
    telefono,
    direccion,
    cp,
    poblacion,
    provincia,
    fecha_nacimiento,
    dni,
    correo_electronico,
    firma_rgpd,
    activo
  } = data;

  const [result] = await pool.query(
    `
    UPDATE clientes
    SET nombre = ?,
        apellidos = ?,
        telefono = ?,
        direccion = ?,
        cp = ?,
        poblacion = ?,
        provincia = ?,
        fecha_nacimiento = ?,
        dni = ?,
        correo_electronico = ?,
        firma_rgpd = ?,
        activo = ?
    WHERE id_cliente = ?
    `,
    [
      nombre,
      apellidos,
      telefono ?? null,
      direccion ?? null,
      cp ?? null,
      poblacion ?? null,
      provincia ?? null,
      fecha_nacimiento ?? null,
      dni,
      correo_electronico ?? null,
      firma_rgpd ?? 0,
      activo ?? 1,
      id
    ]
  );

  return result.affectedRows;
}


// CAMBIAR A ACTIVO
export async function daoCambiarActivo(id, activo) {
  const [result] = await pool.query(
    "UPDATE clientes SET activo = ? WHERE id_cliente = ?",
    [activo, id]
  );
  return result.affectedRows;
}
