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
    <>
      <header className="bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center mb-3">
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
          </div>

          {backHref && (
            <Link href={backHref} className="text-blue-100 text-sm hover:text-white mb-2 inline-block">
              ← {backLabel ?? 'Volver'}
            </Link>
          )}

          <CategoriesNav activeSlug={activeSlug} />
        </div>
      </header>

      {/* Banner Inscribe tu Empresa */}
      <Link
        href="/proponer"
        className="block bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:via-orange-500 hover:to-amber-600 transition-all shadow-md"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
          <span className="text-2xl animate-bounce">🏪</span>
          <div className="text-center">
            <p className="text-white font-extrabold text-base sm:text-lg leading-tight tracking-wide drop-shadow">
              ¡Inscribe tu Empresa aquí!
            </p>
            <p className="text-white/85 text-xs font-medium">Ofrece descuentos exclusivos a nuestra comunidad →</p>
          </div>
          <span className="text-2xl animate-bounce">🏪</span>
        </div>
      </Link>
    </>
  );
}
