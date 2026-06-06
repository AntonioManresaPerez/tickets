import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Configuración de Prisma 7. La URL de conexión vive aquí (ya no en schema.prisma).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
