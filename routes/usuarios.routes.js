import { Router } from "express";
import {
  listarUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  cambiarActivo,
  cambiarPassword
} from "../controllers/usuarios.controller.js";

const router = Router();

router.get("/", listarUsuarios);
router.get("/:id", obtenerUsuarioPorId);
router.post("/", crearUsuario);
router.put("/:id", actualizarUsuario);
router.patch("/:id/activo", cambiarActivo);
router.patch("/:id/password", cambiarPassword);

export default router;
