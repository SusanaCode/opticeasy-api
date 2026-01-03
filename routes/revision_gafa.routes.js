import { Router } from "express";
import {
  obtenerRevisionGafa,
  actualizarRevisionGafa,
  borrarRevisionGafa
} from "../controllers/revision_gafa.controller.js";

const router = Router();

// GET /revisiones-gafa/:id  (detalle)
router.get("/:id", obtenerRevisionGafa);

// PUT /revisiones-gafa/:id  (guardar cambios)
router.put("/:id", actualizarRevisionGafa);

// DELETE /revisiones-gafa/:id (borrar)
router.delete("/:id", borrarRevisionGafa);

export default router;
