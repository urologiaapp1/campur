import Link from 'next/link';
import Image from 'next/image';
import CategoriesNav from '@/components/CategoriesNav';

interface Props {
  activeSlug?: string;
  backHref?: string;
  backLabel?: string;
}

export default function SiteHeader({ activeSlug, backHref, backLabel }: Props) {
  return (
    <header className="bg-blue-600 text-white">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <Image
              src="/logo.png"
              alt="Beneficios Club Pumahue"
              width={48}
              height={48}
              className="rounded-full border-2 border-white/30 flex-shrink-0"
            />
            <div>
              <p className="text-base font-bold tracking-tight leading-tight">Beneficios Club Pumahue</p>
              <p className="text-blue-100 text-xs mt-0.5">Centro General de Padres Colegio Pumahue Temuco</p>
            </div>
          </Link>
          <Link
            href="/proponer"
            className="flex-shrink-0 flex items-center justify-center gap-1.5 bg-white text-blue-600 font-bold text-xs px-3 py-2 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
          >
            ✉️ Proponer
          </Link>
        </div>

        {backHref && (
          <Link href={backHref} className="text-blue-100 text-sm hover:text-white mb-2 inline-block">
            ← {backLabel ?? 'Volver'}
          </Link>
        )}

        <CategoriesNav activeSlug={activeSlug} />
      </div>
    </header>
  );
}
