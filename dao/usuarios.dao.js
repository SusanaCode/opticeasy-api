import { pool } from "../config/db.js";

/** LISTAR */
export async function daoListarUsuarios() {
  const [rows] = await pool.query(
    `
    SELECT
      id_usuario,
      nombre_usuario,
      apellidos_usuario,
      nick_usuario,
      email,
      numero_colegiado,
      codigo_centro,
      rol,
      activo
    FROM usuarios
    ORDER BY id_usuario DESC
    `
  );
  return rows;
}

/** OBTENER POR ID */
export async function daoObtenerUsuarioPorId(idUsuario) {
  const [rows] = await pool.query(
    `
    SELECT
      id_usuario,
      nombre_usuario,
      apellidos_usuario,
      nick_usuario,
      email,
      numero_colegiado,
      codigo_centro,
      rol,
      activo
    FROM usuarios
    WHERE id_usuario = ?
    LIMIT 1
    `,
    [idUsuario]
  );
  return rows[0] ?? null;
}

/** OBTENER POR LOGIN (nick o email) - incluye password_hash */
export async function daoObtenerUsuarioPorNickOEmail(login) {
  const [rows] = await pool.query(
    `
    SELECT
      id_usuario,
      nombre_usuario,
      apellidos_usuario,
      nick_usuario,
      email,
      numero_colegiado,
      password_hash,
      codigo_centro,
      rol,
      activo
    FROM usuarios
    WHERE nick_usuario = ? OR email = ?
    LIMIT 1
    `,
    [login, login]
  );
  return rows[0] ?? null;
}

/** CREAR */
export async function daoCrearUsuario(data) {
  const {
    nombre_usuario,
    apellidos_usuario,
    nick_usuario,
    email,
    numero_colegiado = null,
    password_hash,
    codigo_centro,
    rol,
    activo = 1
  } = data;

  const [result] = await pool.query(
    `
    INSERT INTO usuarios (
      nombre_usuario, apellidos_usuario, nick_usuario, email,
      numero_colegiado, password_hash, codigo_centro, rol, activo
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      nombre_usuario,
      apellidos_usuario,
      nick_usuario,
      email,
      numero_colegiado,
      password_hash,
      codigo_centro,
      rol,
      activo
    ]
  );

  return result.insertId;
}

/** ACTUALIZAR DATOS (sin password) */
export async function daoActualizarUsuario(idUsuario, data) {
  const {
    nombre_usuario,
    apellidos_usuario,
    nick_usuario,
    email,
    numero_colegiado = null,
    codigo_centro,
    rol
  } = data;

  const [result] = await pool.query(
    `
    UPDATE usuarios
    SET
      nombre_usuario = ?,
      apellidos_usuario = ?,
      nick_usuario = ?,
      email = ?,
      numero_colegiado = ?,
      codigo_centro = ?,
      rol = ?
    WHERE id_usuario = ?
    `,
    [
      nombre_usuario,
      apellidos_usuario,
      nick_usuario,
      email,
      numero_colegiado,
      codigo_centro,
      rol,
      idUsuario
    ]
  );

  return result.affectedRows;
}

/** CAMBIAR PASSWORD */
export async function daoCambiarPassword(idUsuario, password_hash) {
  const [result] = await pool.query(
    `
    UPDATE usuarios
    SET password_hash = ?
    WHERE id_usuario = ?
    `,
    [password_hash, idUsuario]
  );
  return result.affectedRows;
}

/** CAMBIAR ACTIVO */
export async function daoCambiarActivoUsuario(idUsuario, activo) {
  const [result] = await pool.query(
    `
    UPDATE usuarios
    SET activo = ?
    WHERE id_usuario = ?
    `,
    [activo, idUsuario]
  );
  return result.affectedRows;
}
