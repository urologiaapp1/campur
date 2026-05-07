'use client';
import { useState } from 'react';
import Image from 'next/image';

interface Props {
  images: { url: string }[];
  title: string;
}

export default function Carousel({ images, title }: Props) {
  const [idx, setIdx] = useState(0);

  if (!images.length) {
    return (
      <div className="w-full aspect-video bg-gray-100 flex items-center justify-center rounded-xl">
        <span className="text-gray-400 text-4xl">🏷️</span>
      </div>
    );
  }

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div className="relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden group">
      <Image
        src={images[idx].url}
        alt={`${title} - imagen ${idx + 1}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 700px"
        priority={idx === 0}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Siguiente"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/50'}`}
                aria-label={`Imagen ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
