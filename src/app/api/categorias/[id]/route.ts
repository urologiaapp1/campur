import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, slug, icon, color, displayOrder } = body;

  const [cat] = await db
    .update(categories)
    .set({ name, slug, icon, color, displayOrder })
    .where(eq(categories.id, Number(id)))
    .returning();

  if (!cat) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(cat);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(categories).where(eq(categories.id, Number(id)));
  return NextResponse.json({ ok: true });
}
