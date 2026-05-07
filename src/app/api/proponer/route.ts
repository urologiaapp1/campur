import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { convenios } from '@/lib/db/schema';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, categoryId, physicalAddress, webUrl, proposerName, proposerEmail } = body;

  if (!title) {
    return NextResponse.json({ error: 'El título es requerido' }, { status: 400 });
  }

  const [conv] = await db.insert(convenios).values({
    title,
    description,
    categoryId: categoryId || null,
    physicalAddress,
    webUrl,
    proposerName,
    proposerEmail,
    status: 'pending',
    active: false,
  }).returning({ id: convenios.id });

  return NextResponse.json({ ok: true, id: conv.id }, { status: 201 });
}
