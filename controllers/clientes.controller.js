import {
  daoBuscarClientes,
  daoListarClientes,
  daoObtenerClientePorId,
  daoCrearCliente,
  daoActualizarCliente,
  daoCambiarActivo 
} from "../dao/clientes.dao.js";

// GET /clientes por campos
export async function buscarClientes(req, res) {
  try {
    const { nombre, apellidos, dni, telefono } = req.query;

    if (!nombre && !apellidos && !dni && !telefono) {
      return res.status(400).json({
        error: "Debes enviar al menos un parámetro: nombre, apellidos, dni o telefono"
      });
    }

    const resultados = await daoBuscarClientes({ nombre, apellidos, dni, telefono });
    res.json(resultados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en búsqueda de clientes" });
  }
}

// GET /clientes lista
export async function listarClientes(req, res) {
  try {
    const clientes = await daoListarClientes();
    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
}

// GET /clientes/:id
export async function obtenerClientePorId(req, res) {
  try {
    const { id } = req.params;

    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const cliente = await daoObtenerClientePorId(idNum);

    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el cliente" });
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

    res.status(201).json({
      mensaje: "Cliente creado correctamente",
      id_cliente
    });

  } catch (error) {
  
    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El DNI ya existe" });
    }

    console.error(error);
    res.status(500).json({ error: "Error al crear cliente" });
  }
}

//actualiza cliente

export async function actualizarCliente(req, res) {
  try {
    const idNum = Number(req.params.id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return res.status(400).json({ error: "ID inválido" });
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

    //obligatorios reales según tu SQL
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

    return res.json({ ok: true, mensaje: "Cliente actualizado correctamente" });

  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El DNI ya existe" });
    }
    console.error(error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
}

// CAMBIA A ACTIVO

export async function cambiarActivo(req, res) {
  try {
    const idNum = Number(req.params.id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const { activo } = req.body ?? {};
    if (activo !== 0 && activo !== 1) {
      return res.status(400).json({ error: "activo debe ser 0 o 1" });
    }

    const affected = await daoCambiarActivo(idNum, activo);
    if (affected === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ ok: true, activo });
 } catch (error) {
  res.status(500).json({
    error: "Error cambiando activo",
    detalle: error?.message,
    code: error?.code,
    sqlMessage: error?.sqlMessage
  });
}

}