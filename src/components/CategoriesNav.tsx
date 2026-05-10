import Link from 'next/link';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';

function isUrl(s: string) { return s.startsWith('http'); }

export default async function CategoriesNav({ activeSlug }: { activeSlug?: string }) {
  const cats = await db.select().from(categories).orderBy(categories.displayOrder, categories.name);
  if (!cats.length) return null;

  return (
    <nav className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
      {cats.map((cat) => {
        const active = cat.slug === activeSlug;
        return (
          <Link
            key={cat.id}
            href={`/categoria/${cat.slug}`}
            className={`flex-shrink-0 flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
              active
                ? 'bg-white text-blue-600 shadow-sm'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            {isUrl(cat.icon)
              /* eslint-disable-next-line @next/next/no-img-element */
              ? <img src={cat.icon} alt="" className="w-4 h-4 rounded object-cover" />
              : <span>{cat.icon}</span>}
            <span>{cat.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
