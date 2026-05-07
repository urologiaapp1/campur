import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { admins } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { username, password } = await req.json();

  const updates: Partial<typeof admins.$inferInsert> = {};
  if (username) updates.username = username;
  if (password) updates.passwordHash = await hash(password, 10);

  const [admin] = await db
    .update(admins)
    .set(updates)
    .where(eq(admins.id, Number(id)))
    .returning({ id: admins.id, username: admins.username, createdAt: admins.createdAt });

  if (!admin) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(admin);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(admins).where(eq(admins.id, Number(id)));
  return NextResponse.json({ ok: true });
}
