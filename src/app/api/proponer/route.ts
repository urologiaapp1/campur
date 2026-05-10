import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { convenios, convenioImages } from '@/lib/db/schema';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title, discountText, description, categoryId,
    startDate, endDate, periods,
    physicalAddress, webUrl, instagram, contactPhone,
    proposerName, proposerEmail, proposerPhone, images,
  } = body;

  if (!title) return NextResponse.json({ error: 'El nombre de empresa es requerido' }, { status: 400 });
  if (!proposerName) return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
  if (!proposerEmail) return NextResponse.json({ error: 'El correo es requerido' }, { status: 400 });
  if (!proposerPhone) return NextResponse.json({ error: 'El teléfono es requerido' }, { status: 400 });

  const [conv] = await db.insert(convenios).values({
    title,
    discountText: discountText || null,
    description: description || null,
    categoryId: categoryId || null,
    startDate: startDate || null,
    endDate: endDate || null,
    periods: periods || [],
    physicalAddress: physicalAddress || null,
    webUrl: webUrl || null,
    instagram: instagram || null,
    contactPhone: contactPhone || null,
    proposerName,
    proposerEmail,
    proposerPhone,
    status: 'pending',
    active: false,
  }).returning({ id: convenios.id });

  if (images?.length) {
    await db.insert(convenioImages).values(
      images.map((url: string, i: number) => ({
        convenioId: conv.id,
        url,
        displayOrder: i,
      }))
    );
  }

  return NextResponse.json({ ok: true, id: conv.id }, { status: 201 });
}
