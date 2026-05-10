import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { convenios, convenioImages, categories } from '@/lib/db/schema';
import { desc, eq, and, sql } from 'drizzle-orm';

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
  if (categoryId) {
    conditions.push(
      sql`(${convenios.categoryId} = ${categoryId} OR ${convenios.categoryIds} @> ${JSON.stringify([categoryId])}::jsonb)`
    );
  }

  const rows = await db
    .select({ convenio: convenios })
    .from(convenios)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(convenios.views), desc(convenios.createdAt));

  const ids = rows.map(r => r.convenio.id);
  const [allImages, allCats] = ids.length
    ? await Promise.all([
        db.select().from(convenioImages),
        db.select().from(categories),
      ])
    : [[], []];

  const result = rows.map(r => {
    const conv = r.convenio;
    const catIds: number[] = (conv.categoryIds as number[])?.length
      ? (conv.categoryIds as number[])
      : conv.categoryId ? [conv.categoryId] : [];
    return {
      ...conv,
      category: allCats.find(c => c.id === catIds[0]) ?? null,
      categories: catIds.map(id => allCats.find(c => c.id === id)).filter(Boolean),
      images: allImages.filter(img => img.convenioId === conv.id).sort((a, b) => a.displayOrder - b.displayOrder),
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title, description, discountText, startDate, endDate,
    periods, physicalAddress, webUrl, instagram, contactPhone, categoryId, categoryIds, active, images,
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
    instagram,
    contactPhone,
    categoryId: categoryId || (categoryIds?.[0] ?? null),
    categoryIds: categoryIds || [],
    active: active ?? true,
  }).returning();

  if (images?.length) {
    await db.insert(convenioImages).values(
      images.map((url: string, i: number) => ({ convenioId: conv.id, url, displayOrder: i }))
    );
  }

  return NextResponse.json(conv, { status: 201 });
}
