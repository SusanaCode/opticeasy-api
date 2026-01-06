// controllers/usuarios.controller.js
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

// Roles permitidos (lo que mandará tu desplegable Android)
const ROLES_VALIDOS = new Set(["optico", "comercial"]);

function isValidEmail(email) {
  // Validación básica (suficiente para backend de proyecto)
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function normalizeRol(rol) {
  if (typeof rol !== "string") return null;
  const r = rol.trim().toLowerCase();
  return ROLES_VALIDOS.has(r) ? r : null;
}

function parseDupField(err) {
  // MySQL suele devolver algo como: "Duplicate entry ... for key 'usuarios.email'"
  const msg = (err?.sqlMessage || err?.message || "").toLowerCase();

  if (msg.includes("nick_usuario")) return "nick";
  if (msg.includes("email")) return "email";
  if (msg.includes("numero_colegiado")) return "numero_colegiado";

  // A veces el key viene sin nombre de columna, pero con el índice
  if (msg.includes("nick")) return "nick";
  if (msg.includes("coleg")) return "numero_colegiado";

  return null;
}

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
      return res.status(400).json({ error: "ID inválido" });
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

    // Obligatorios
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

    // Normalizar / validar
    const emailNorm = String(email).trim();
    if (!isValidEmail(emailNorm)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    const nickNorm = String(nick_usuario).trim();
    if (nickNorm.includes(" ")) {
      return res.status(400).json({ error: "El nick no puede contener espacios" });
    }

    const rolNorm = normalizeRol(rol);
    if (!rolNorm) {
      return res.status(400).json({ error: "Rol inválido (optico o comercial)" });
    }

    const codigoCentroNorm = String(codigo_centro).trim();
    if (codigoCentroNorm.length === 0 || codigoCentroNorm.length > 10) {
      return res.status(400).json({ error: "codigo_centro inválido (máx 10)" });
    }

    const passNorm = String(password);
    if (passNorm.length < 6) {
      return res.status(400).json({ error: "Password inválida (mínimo 6 caracteres)" });
    }

    // Regla de tu UI: colegiado solo si rol=optico
    let colegiadoFinal = numero_colegiado;
    if (rolNorm === "comercial") {
      colegiadoFinal = null;
    } else {
      // optico: si viene, validamos que sea número (si quieres hacerlo obligatorio, aquí lo fuerzas)
      if (colegiadoFinal !== null && colegiadoFinal !== undefined && colegiadoFinal !== "") {
        const n = Number(colegiadoFinal);
        if (!Number.isInteger(n) || n <= 0) {
          return res.status(400).json({ error: "numero_colegiado inválido" });
        }
        colegiadoFinal = n;
      }
      // Si quieres que optico SIEMPRE tenga colegiado, descomenta:
      // if (colegiadoFinal === null || colegiadoFinal === undefined || colegiadoFinal === "") {
      //   return res.status(400).json({ error: "numero_colegiado es obligatorio para óptico" });
      // }
    }

    const password_hash = await bcrypt.hash(passNorm, 10);

    const insertId = await daoCrearUsuario({
      nombre_usuario: String(nombre_usuario).trim(),
      apellidos_usuario: String(apellidos_usuario).trim(),
      nick_usuario: nickNorm,
      email: emailNorm,
      numero_colegiado: colegiadoFinal,
      password_hash,
      codigo_centro: codigoCentroNorm,
      rol: rolNorm,
      activo: activo ?? 1
    });

    const created = await daoObtenerUsuarioPorId(insertId);
    return res.status(201).json(created);
  } catch (err) {
    // Duplicados
    if (err?.code === "ER_DUP_ENTRY") {
      const campo = parseDupField(err);
      if (campo === "email") return res.status(409).json({ error: "El email ya existe" });
      if (campo === "nick") return res.status(409).json({ error: "El nick ya existe" });
      if (campo === "numero_colegiado")
        return res.status(409).json({ error: "El número de colegiado ya existe" });

      return res.status(409).json({ error: "Dato duplicado" });
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
      return res.status(400).json({ error: "ID inválido" });
    }

    const body = req.body ?? {};

    // Si actualizas, mejor exigir que vengan los campos principales (según tu DAO)
    const {
      nombre_usuario,
      apellidos_usuario,
      nick_usuario,
      email,
      numero_colegiado = null,
      codigo_centro,
      rol
    } = body;

    if (!nombre_usuario || !apellidos_usuario || !nick_usuario || !email || !codigo_centro || !rol) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const emailNorm = String(email).trim();
    if (!isValidEmail(emailNorm)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    const nickNorm = String(nick_usuario).trim();
    if (nickNorm.includes(" ")) {
      return res.status(400).json({ error: "El nick no puede contener espacios" });
    }

    const rolNorm = normalizeRol(rol);
    if (!rolNorm) {
      return res.status(400).json({ error: "Rol inválido (optico o comercial)" });
    }

    const codigoCentroNorm = String(codigo_centro).trim();
    if (codigoCentroNorm.length === 0 || codigoCentroNorm.length > 10) {
      return res.status(400).json({ error: "codigo_centro inválido (máx 10)" });
    }

    let colegiadoFinal = numero_colegiado;
    if (rolNorm === "comercial") {
      colegiadoFinal = null;
    } else {
      if (colegiadoFinal !== null && colegiadoFinal !== undefined && colegiadoFinal !== "") {
        const n = Number(colegiadoFinal);
        if (!Number.isInteger(n) || n <= 0) {
          return res.status(400).json({ error: "numero_colegiado inválido" });
        }
        colegiadoFinal = n;
      }
    }

    const affected = await daoActualizarUsuario(id, {
      nombre_usuario: String(nombre_usuario).trim(),
      apellidos_usuario: String(apellidos_usuario).trim(),
      nick_usuario: nickNorm,
      email: emailNorm,
      numero_colegiado: colegiadoFinal,
      codigo_centro: codigoCentroNorm,
      rol: rolNorm
    });

    if (affected === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    const updated = await daoObtenerUsuarioPorId(id);
    return res.json(updated);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      const campo = parseDupField(err);
      if (campo === "email") return res.status(409).json({ error: "El email ya existe" });
      if (campo === "nick") return res.status(409).json({ error: "El nick ya existe" });
      if (campo === "numero_colegiado")
        return res.status(409).json({ error: "El número de colegiado ya existe" });

      return res.status(409).json({ error: "Dato duplicado" });
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
      return res.status(400).json({ error: "ID inválido" });
    }

    const { activo } = req.body ?? {};
    if (activo !== 0 && activo !== 1) {
      return res.status(400).json({ error: "activo debe ser 0 o 1" });
    }

    const affected = await daoCambiarActivoUsuario(id, activo);
    if (affected === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    const updated = await daoObtenerUsuarioPorId(id);
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
      return res.status(400).json({ error: "ID inválido" });
    }

    const { password } = req.body ?? {};
    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: "Password inválida (mínimo 6 caracteres)" });
    }

    const password_hash = await bcrypt.hash(String(password), 10);
    const affected = await daoCambiarPassword(id, password_hash);
    if (affected === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    return res.json({ ok: true, mensaje: "Password actualizada" });
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

    const user = await daoObtenerUsuarioPorNickOEmail(String(loginValue).trim());
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });
    if (user.activo !== 1) return res.status(403).json({ error: "Usuario inactivo" });

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const { password_hash, ...safe } = user;
    return res.json(safe);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error en login" });
  }
}

