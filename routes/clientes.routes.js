import { Router } from "express";
import {
  buscarClientes,
  listarClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  cambiarActivo
} from "../controllers/clientes.controller.js";

import {
  listarFirmasDeCliente,
  crearFirmaParaCliente
} from "../controllers/firmas.controller.js";

import {
  listarRevisionesGafaDeCliente,
  crearRevisionGafaParaCliente
} from "../controllers/revision_gafa.controller.js";

import {
  listarRevisionesLcPorCliente,
  crearRevisionLc
} from "../controllers/revision_lc.controller.js";


const router = Router();

function soloOptico(req, res, next) {
  if (req.user?.rol !== "optico") {
    return res.status(403).json({ error: "No tienes permisos para crear revisiones" });
  }
  next();
}

// Clientes
router.get("/buscar", buscarClientes);
router.get("/", listarClientes);
router.get("/:id", obtenerClientePorId);
router.post("/", crearCliente);
router.put("/:id", actualizarCliente);
router.patch("/:id/activo", cambiarActivo);

// Firmas RGPD
router.get("/:id/firmas", listarFirmasDeCliente);
router.post("/:id/firmas", crearFirmaParaCliente);

// Revisiones de gafa
router.get("/:id/revisiones-gafa", listarRevisionesGafaDeCliente);
router.post("/:id/revisiones-gafa", soloOptico, crearRevisionGafaParaCliente);

// Revisiones LC
router.get("/:idCliente/revision-lc", listarRevisionesLcPorCliente);
router.post("/:idCliente/revision-lc", soloOptico, crearRevisionLc);

// Revisiones LC (nuevo, simétrico con gafa)
router.get("/:id/revisiones-lc", listarRevisionesLcPorCliente);
router.post("/:id/revisiones-lc", soloOptico, crearRevisionLc);
export default router;


