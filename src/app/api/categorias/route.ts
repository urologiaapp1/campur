import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  const rows = await db.select().from(categories).orderBy(asc(categories.displayOrder), asc(categories.name));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, slug, icon, color, displayOrder } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 });
  }

  const [cat] = await db.insert(categories).values({
    name,
    slug,
    icon: icon || '🏷️',
    color: color || '#2563eb',
    displayOrder: displayOrder ?? 0,
  }).returning();

  return NextResponse.json(cat, { status: 201 });
}
