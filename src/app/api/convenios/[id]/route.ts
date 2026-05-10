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
    periods, physicalAddress, webUrl, categoryId, active, images, status,
  } = body;

  // Build partial update — only set fields that were sent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = { updatedAt: new Date() };
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (discountText !== undefined) updates.discountText = discountText;
  if (startDate !== undefined) updates.startDate = startDate || null;
  if (endDate !== undefined) updates.endDate = endDate || null;
  if (periods !== undefined) updates.periods = periods;
  if (physicalAddress !== undefined) updates.physicalAddress = physicalAddress;
  if (webUrl !== undefined) updates.webUrl = webUrl;
  if (categoryId !== undefined) updates.categoryId = categoryId || null;
  if (body.categoryIds !== undefined) updates.categoryIds = body.categoryIds;
  if (active !== undefined) updates.active = active;
  if (status !== undefined) updates.status = status;

  const [conv] = await db
    .update(convenios)
    .set(updates)
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
