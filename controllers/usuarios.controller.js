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
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error listando usuarios" });
  }
}

/** GET /usuarios/:id */
export async function obtenerUsuarioPorId(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID usuario inválido" });
    }

    const row = await daoObtenerUsuarioPorId(id);
    if (!row) return res.status(404).json({ error: "Usuario no encontrado" });

    return res.json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error obteniendo usuario" });
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
    } = req.body ?? {};

    if (
      !nombre_usuario ||
      !apellidos_usuario ||
      !nick_usuario ||
      !email ||
      !password ||
      !codigo_centro ||
      !rol
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res
        .status(400)
        .json({ error: "password inválida (mínimo 6 caracteres)" });
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

    // Si tu DAO devuelve password_hash, lo quitamos por seguridad
    if (created && created.password_hash !== undefined) {
      const { password_hash: _, ...safe } = created;
      return res.status(201).json(safe);
    }

    return res.status(201).json(created);
  } catch (err) {
    // típicos ER_DUP_ENTRY por nick/email/colegiado únicos
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Nick/email/colegiado ya existe" });
    }

    console.error(err);
    return res.status(500).json({ error: "Error creando usuario" });
  }
}

/** PUT /usuarios/:id  (sin password) */
export async function actualizarUsuario(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID usuario inválido" });
    }

    const affected = await daoActualizarUsuario(id, req.body);
    if (affected === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    const updated = await daoObtenerUsuarioPorId(id);

    if (updated && updated.password_hash !== undefined) {
      const { password_hash: _, ...safe } = updated;
      return res.json(safe);
    }

    return res.json(updated);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Nick/email/colegiado ya existe" });
    }

    console.error(err);
    return res.status(500).json({ error: "Error actualizando usuario" });
  }
}

/** PATCH /usuarios/:id/activo */
export async function cambiarActivo(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID usuario inválido" });
    }

    const { activo } = req.body ?? {};
    if (activo !== 0 && activo !== 1) {
      return res.status(400).json({ error: "activo debe ser 0 o 1" });
    }

    const affected = await daoCambiarActivoUsuario(id, activo);
    if (affected === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    const updated = await daoObtenerUsuarioPorId(id);

    if (updated && updated.password_hash !== undefined) {
      const { password_hash: _, ...safe } = updated;
      return res.json(safe);
    }

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error cambiando activo" });
  }
}

/** PATCH /usuarios/:id/password */
export async function cambiarPassword(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID usuario inválido" });
    }

    const { password } = req.body ?? {};
    if (!password || typeof password !== "string" || password.length < 6) {
      return res
        .status(400)
        .json({ error: "password inválida (mínimo 6 caracteres)" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const affected = await daoCambiarPassword(id, password_hash);
    if (affected === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error cambiando password" });
  }
}

/** POST /auth/login  (login = nick o email, password) */
export async function login(req, res) {
  try {
    const { login: loginValue, password } = req.body ?? {};

    if (!loginValue || !password) {
      return res.status(400).json({ error: "login y password son obligatorios" });
    }

    const user = await daoObtenerUsuarioPorNickOEmail(loginValue);
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });
    if (user.activo !== 1) return res.status(403).json({ error: "Usuario inactivo" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const { password_hash, ...safe } = user;
    return res.json(safe);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error en login" });
  }
}

