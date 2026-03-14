import express from "express";
import "dotenv/config";

import clientesRoutes from "./routes/clientes.routes.js";
import firmasRoutes from "./routes/firmas.routes.js";
import revisionLcRoutes from "./routes/revision_lc.routes.js";

import usuariosRoutes from "./routes/usuarios.routes.js";
import authRoutes from "./routes/auth.routes.js";

import { verifyToken } from "./middleware/auth.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/auth/me", verifyToken, (req, res) => {
  res.json({
    ok: true,
    user: req.user
  });
});


app.get("/", (req, res) => {
  res.send("OpticEasy API funcionando ✅ v2");
});


// RUTAS
app.use("/clientes", clientesRoutes);
app.use("/firmas", firmasRoutes);
app.use("/",revisionLcRoutes);
app.use("/usuarios", verifyToken, usuariosRoutes);
app.use("/auth", authRoutes);

// ARRANQUE
app.listen(PORT, () => {
  console.log(`Servidor arrancado en http://localhost:${PORT}`);
});




