import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminName = process.env.ADMIN_NAME ?? "Administrador";
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@ejemplo.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin1234";

  // Solo se crea la cuenta de administrador. El resto de usuarios se dan de alta
  // desde la sección "Usuarios" de la app.
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: adminName,
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      role: Role.ADMIN,
    },
  });

  // Etiquetas iniciales (el admin puede añadir más desde la app).
  for (const name of ["backend", "frontend", "base de datos"]) {
    await prisma.label.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log("✔ Seed completado (admin + etiquetas iniciales).");
  console.log(`  Admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
