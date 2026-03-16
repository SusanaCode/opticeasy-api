import express from "express";
import "dotenv/config";

import clientesRoutes from "./routes/clientes.routes.js";
import firmasRoutes from "./routes/firmas.routes.js";
import revisionLcRoutes from "./routes/revision_lc.routes.js";
import revisionGafaRoutes from "./routes/revision_gafa.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import authRoutes from "./routes/auth.routes.js";

import { verifyToken } from "./middleware/auth.js";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT ?? 3000;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Demasiados intentos de login. Inténtalo de nuevo en 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { error: "Demasiadas peticiones. Inténtalo de nuevo en un minuto." },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(helmet());

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/auth/login", loginLimiter);

app.use((req, res, next) => {
  if (req.path === "/auth/login") return next();
  apiLimiter(req, res, next);
});

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
app.use("/clientes", verifyToken, clientesRoutes);
app.use("/firmas", verifyToken, firmasRoutes);
app.use("/revision-lc", verifyToken, revisionLcRoutes);
app.use("/revisiones-gafa", verifyToken, revisionGafaRoutes);
app.use("/usuarios", verifyToken, usuariosRoutes);
app.use("/auth", authRoutes);

// ARRANQUE
app.listen(PORT, () => {
  console.log(`Servidor arrancado en http://localhost:${PORT}`);
});


