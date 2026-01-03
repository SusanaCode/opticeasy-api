import { Router } from "express";
import {
  listarRevisionesLcPorCliente,
  obtenerRevisionLcPorId,
  crearRevisionLc,
  actualizarRevisionLc,
  borrarRevisionLc
} from "../controllers/revision_lc.controller.js";

const router = Router();


// Por revisión
router.get("/revision-lc/:id", obtenerRevisionLcPorId);
router.put("/revision-lc/:id", actualizarRevisionLc);  
router.delete("/revision-lc/:id", borrarRevisionLc);

export default router;
