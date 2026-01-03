import express from "express";
import "dotenv/config";

import clientesRoutes from "./routes/clientes.routes.js";
import firmasRoutes from "./routes/firmas.routes.js";
import revisionLcRoutes from "./routes/revision_lc.routes.js";

import usuariosRoutes from "./routes/usuarios.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());



app.get("/", (req, res) => {
  res.send("OpticEasy API funcionando ✅");
});

// RUTAS
app.use("/clientes", clientesRoutes);
app.use("/firmas", firmasRoutes);
app.use("/",revisionLcRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/auth", authRoutes);

// ARRANQUE
app.listen(PORT, () => {
  console.log(`Servidor arrancado en http://localhost:${PORT}`);
});




