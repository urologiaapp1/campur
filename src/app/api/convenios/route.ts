import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { convenios, convenioImages, categories } from '@/lib/db/schema';
import { desc, eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get('categoria');
  const activeOnly = searchParams.get('active') !== 'false';

  let categoryId: number | undefined;
  if (categorySlug) {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, categorySlug));
    if (!cat) return NextResponse.json([]);
    categoryId = cat.id;
  }

  const conditions = [];
  if (activeOnly) conditions.push(eq(convenios.active, true));
  if (categoryId) conditions.push(eq(convenios.categoryId, categoryId));

  const rows = await db
    .select({
      convenio: convenios,
      category: categories,
    })
    .from(convenios)
    .leftJoin(categories, eq(convenios.categoryId, categories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(convenios.views), desc(convenios.createdAt));

  const ids = rows.map((r) => r.convenio.id);
  const images =
    ids.length > 0
      ? await db
          .select()
          .from(convenioImages)
          .where(eq(convenioImages.convenioId, ids[0]))
      : [];

  // Fetch images for all convenios
  const allImages =
    ids.length > 0
      ? await db.select().from(convenioImages)
      : [];

  const result = rows.map((r) => ({
    ...r.convenio,
    category: r.category,
    images: allImages
      .filter((img) => img.convenioId === r.convenio.id)
      .sort((a, b) => a.displayOrder - b.displayOrder),
  }));

  void images;
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title, description, discountText, startDate, endDate,
    periods, physicalAddress, webUrl, categoryId, active, images,
  } = body;

  if (!title) {
    return NextResponse.json({ error: 'El título es requerido' }, { status: 400 });
  }

  const [conv] = await db.insert(convenios).values({
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
  }).returning();

  if (images?.length) {
    await db.insert(convenioImages).values(
      images.map((url: string, i: number) => ({
        convenioId: conv.id,
        url,
        displayOrder: i,
      }))
    );
  }

  return NextResponse.json(conv, { status: 201 });
}
