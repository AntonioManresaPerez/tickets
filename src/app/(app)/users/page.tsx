import { format } from "date-fns";
import { es } from "date-fns/locale";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserForm } from "@/components/user-form";
import { UsersManager } from "@/components/users-manager";

export default async function UsersPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const data = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    created: format(u.createdAt, "d MMM yyyy", { locale: es }),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Usuarios</h1>
        <p className="mt-1 text-slate-500">Gestiona las cuentas del equipo</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UsersManager users={data} />
        </div>
        <div>
          <UserForm />
        </div>
      </div>
    </div>
  );
}
