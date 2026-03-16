import { Router } from "express";
import {
  obtenerRevisionLcPorId,
  actualizarRevisionLc,
  borrarRevisionLc
} from "../controllers/revision_lc.controller.js";

const router = Router();

// Por revisión
router.get("/:id", obtenerRevisionLcPorId);
router.put("/:id", actualizarRevisionLc);
router.delete("/:id", borrarRevisionLc);

export default router;