import bcrypt from "bcryptjs";
import {
  daoListarUsuarios,
  daoObtenerUsuarioPorId,
  daoObtenerUsuarioPorNickOEmail,
  daoCrearUsuario,
  daoActualizarUsuario,
  daoCambiarPassword,
  daoCambiarActivoUsuario
} from "../dao/usuarios.dao.js";

/** GET /usuarios */
export async function listarUsuarios(req, res) {
  try {
    const rows = await daoListarUsuarios();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error listando usuarios", error: err.message });
  }
}

/** GET /usuarios/:id */
export async function obtenerUsuarioPorId(req, res) {
  try {
    const id = Number(req.params.id);
    const row = await daoObtenerUsuarioPorId(id);
    if (!row) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(row);
  } catch (err) {
    res.status(500).json({ message: "Error obteniendo usuario", error: err.message });
  }
}

/** POST /usuarios  (recibe password en claro) */
export async function crearUsuario(req, res) {
  try {
    const {
      nombre_usuario,
      apellidos_usuario,
      nick_usuario,
      email,
      numero_colegiado = null,
      password,
      codigo_centro,
      rol,
      activo = 1
    } = req.body;

    // Validación mínima
    if (!nombre_usuario || !apellidos_usuario || !nick_usuario || !email || !password || !codigo_centro || !rol) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const insertId = await daoCrearUsuario({
      nombre_usuario,
      apellidos_usuario,
      nick_usuario,
      email,
      numero_colegiado,
      password_hash,
      codigo_centro,
      rol,
      activo
    });

    const created = await daoObtenerUsuarioPorId(insertId);
    res.status(201).json(created);
  } catch (err) {
    // Aquí caerán típicos ER_DUP_ENTRY por nick/email/colegiado únicos
    res.status(500).json({ message: "Error creando usuario", error: err.message });
  }
}

/** PUT /usuarios/:id  (sin password) */
export async function actualizarUsuario(req, res) {
  try {
    const id = Number(req.params.id);

    const affected = await daoActualizarUsuario(id, req.body);
    if (affected === 0) return res.status(404).json({ message: "Usuario no encontrado" });

    const updated = await daoObtenerUsuarioPorId(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error actualizando usuario", error: err.message });
  }
}

/** PATCH /usuarios/:id/activo */
export async function cambiarActivo(req, res) {
  try {
    const id = Number(req.params.id);
    const { activo } = req.body;

    if (activo !== 0 && activo !== 1) {
      return res.status(400).json({ message: "activo debe ser 0 o 1" });
    }

    const affected = await daoCambiarActivoUsuario(id, activo);
    if (affected === 0) return res.status(404).json({ message: "Usuario no encontrado" });

    const updated = await daoObtenerUsuarioPorId(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error cambiando activo", error: err.message });
  }
}

/** PATCH /usuarios/:id/password */
export async function cambiarPassword(req, res) {
  try {
    const id = Number(req.params.id);
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "password inválida (mínimo 6 caracteres)" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const affected = await daoCambiarPassword(id, password_hash);
    if (affected === 0) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Password actualizada" });
  } catch (err) {
    res.status(500).json({ message: "Error cambiando password", error: err.message });
  }
}

/** POST /auth/login  (login = nick o email, password) */
export async function login(req, res) {
  try {
    const { login: loginValue, password } = req.body;

    if (!loginValue || !password) {
      return res.status(400).json({ message: "login y password son obligatorios" });
    }

    const user = await daoObtenerUsuarioPorNickOEmail(loginValue);
    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });
    if (user.activo !== 1) return res.status(403).json({ message: "Usuario inactivo" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

    // No devolvemos hash
    const { password_hash, ...safe } = user;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: "Error en login", error: err.message });
  }
}
