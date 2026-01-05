import {
  daoBuscarClientes,
  daoListarClientes,
  daoObtenerClientePorId,
  daoCrearCliente,
  daoActualizarCliente,
  daoCambiarActivo
} from "../dao/clientes.dao.js";

// GET /clientes/buscar?nombre=&apellidos=&dni=&telefono=
export async function buscarClientes(req, res) {
  try {
    const { nombre, apellidos, dni, telefono } = req.query;

    if (!nombre && !apellidos && !dni && !telefono) {
      return res.status(400).json({
        error:
          "Debes enviar al menos un parámetro: nombre, apellidos, dni o telefono"
      });
    }

    const resultados = await daoBuscarClientes({ nombre, apellidos, dni, telefono });
    return res.json(resultados);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error buscando clientes" });
  }
}

// GET /clientes
export async function listarClientes(req, res) {
  try {
    const clientes = await daoListarClientes();
    return res.json(clientes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error listando clientes" });
  }
}

// GET /clientes/:id
export async function obtenerClientePorId(req, res) {
  try {
    const idNum = Number(req.params.id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return res.status(400).json({ error: "ID cliente inválido" });
    }

    const cliente = await daoObtenerClientePorId(idNum);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    return res.json(cliente);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error obteniendo el cliente" });
  }
}

// POST /clientes
export async function crearCliente(req, res) {
  try {
    const {
      nombre,
      apellidos,
      dni,
      telefono,
      direccion,
      cp,
      poblacion,
      provincia,
      fecha_nacimiento,
      correo_electronico,
      firma_rgpd,
      activo
    } = req.body ?? {};

    if (!nombre || !apellidos || !dni) {
      return res.status(400).json({
        error: "nombre, apellidos y dni son obligatorios"
      });
    }

    const data = {
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      dni: dni.trim(),
      telefono: telefono?.trim() ?? null,
      direccion: direccion?.trim() ?? null,
      cp: cp?.trim() ?? null,
      poblacion: poblacion?.trim() ?? null,
      provincia: provincia?.trim() ?? null,
      fecha_nacimiento: fecha_nacimiento ?? null,
      correo_electronico: correo_electronico?.trim() ?? null,
      firma_rgpd: firma_rgpd ?? 0,
      activo: activo ?? 1
    };

    const id_cliente = await daoCrearCliente(data);

    return res.status(201).json({
      ok: true,
      id_cliente
    });
  } catch (error) {
    // DNI duplicado
    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El DNI ya existe" });
    }

    console.error(error);
    return res.status(500).json({ error: "Error creando cliente" });
  }
}

// PUT /clientes/:id
export async function actualizarCliente(req, res) {
  try {
    const idNum = Number(req.params.id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return res.status(400).json({ error: "ID cliente inválido" });
    }

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
    } = req.body ?? {};

    // obligatorios según tu SQL
    if (!nombre || !apellidos || !dni) {
      return res.status(400).json({
        error: "nombre, apellidos y dni son obligatorios"
      });
    }

    const data = {
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      dni: dni.trim(),
      telefono: telefono?.trim() ?? null,
      direccion: direccion?.trim() ?? null,
      cp: cp?.trim() ?? null,
      poblacion: poblacion?.trim() ?? null,
      provincia: provincia?.trim() ?? null,
      fecha_nacimiento: fecha_nacimiento ?? null,
      correo_electronico: correo_electronico?.trim() ?? null,
      firma_rgpd: firma_rgpd ?? 0,
      activo: activo ?? 1
    };

    const affected = await daoActualizarCliente(idNum, data);

    if (affected === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    return res.json({ ok: true });
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El DNI ya existe" });
    }

    console.error(error);
    return res.status(500).json({ error: "Error actualizando cliente" });
  }
}

// PATCH /clientes/:id/activo
export async function cambiarActivo(req, res) {
  try {
    const idNum = Number(req.params.id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return res.status(400).json({ error: "ID cliente inválido" });
    }

    const { activo } = req.body ?? {};
    if (activo !== 0 && activo !== 1) {
      return res.status(400).json({ error: "activo debe ser 0 o 1" });
    }

    const affected = await daoCambiarActivo(idNum, activo);
    if (affected === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    return res.json({ ok: true, activo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error cambiando activo" });
  }
}
