import { db } from '@/lib/db';
import { convenios, categories, admins } from '@/lib/db/schema';
import { count, eq } from 'drizzle-orm';
import Link from 'next/link';

export default async function DashboardPage() {
  const [[{ total: totalConvenios }], [{ total: activeConvenios }], [{ total: totalCats }], [{ total: totalAdmins }]] =
    await Promise.all([
      db.select({ total: count() }).from(convenios),
      db.select({ total: count() }).from(convenios).where(eq(convenios.active, true)),
      db.select({ total: count() }).from(categories),
      db.select({ total: count() }).from(admins),
    ]);

  const stats = [
    { label: 'Total convenios', value: totalConvenios, icon: '🏷️', color: 'bg-blue-50 text-blue-700' },
    { label: 'Activos', value: activeConvenios, icon: '✅', color: 'bg-green-50 text-green-700' },
    { label: 'Categorías', value: totalCats, icon: '📂', color: 'bg-purple-50 text-purple-700' },
    { label: 'Administradores', value: totalAdmins, icon: '👤', color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm font-medium opacity-75 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/convenios/nuevo"
          className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="text-3xl">➕</span>
          <div>
            <div className="font-bold text-gray-900">Nuevo convenio</div>
            <div className="text-sm text-gray-500">Agregar un nuevo descuento</div>
          </div>
        </Link>
        <Link
          href="/admin/categorias"
          className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="text-3xl">📂</span>
          <div>
            <div className="font-bold text-gray-900">Gestionar categorías</div>
            <div className="text-sm text-gray-500">Agregar o editar categorías</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
