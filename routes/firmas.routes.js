import { Router } from "express";
import { obtenerFirma } from "../controllers/firmas.controller.js";

const router = Router();

// GET /firmas/:id
router.get("/:id", obtenerFirma);

export default router;

