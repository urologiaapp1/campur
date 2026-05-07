import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { convenios, convenioImages, categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [row] = await db
    .select({ convenio: convenios, category: categories })
    .from(convenios)
    .leftJoin(categories, eq(convenios.categoryId, categories.id))
    .where(eq(convenios.id, Number(id)));

  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const images = await db
    .select()
    .from(convenioImages)
    .where(eq(convenioImages.convenioId, Number(id)))
    .orderBy(convenioImages.displayOrder);

  // Increment views
  await db
    .update(convenios)
    .set({ views: (row.convenio.views ?? 0) + 1 })
    .where(eq(convenios.id, Number(id)));

  return NextResponse.json({ ...row.convenio, category: row.category, images });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const {
    title, description, discountText, startDate, endDate,
    periods, physicalAddress, webUrl, categoryId, active, images,
  } = body;

  const [conv] = await db
    .update(convenios)
    .set({
      title,
      description,
      discountText,
      startDate: startDate || null,
      endDate: endDate || null,
      periods: periods || [],
      physicalAddress,
      webUrl,
      categoryId: categoryId || null,
      active: active ?? true,
      updatedAt: new Date(),
    })
    .where(eq(convenios.id, Number(id)))
    .returning();

  if (!conv) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  // Replace images
  if (images !== undefined) {
    await db.delete(convenioImages).where(eq(convenioImages.convenioId, Number(id)));
    if (images.length) {
      await db.insert(convenioImages).values(
        images.map((url: string, i: number) => ({
          convenioId: conv.id,
          url,
          displayOrder: i,
        }))
      );
    }
  }

  return NextResponse.json(conv);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(convenios).where(eq(convenios.id, Number(id)));
  return NextResponse.json({ ok: true });
}
