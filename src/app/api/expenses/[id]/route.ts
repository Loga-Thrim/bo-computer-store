import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      date: data.date ? new Date(data.date) : undefined,
      category: data.category,
      amount: data.amount ? parseFloat(data.amount) : undefined,
      description: data.description,
    },
  });

  return NextResponse.json(expense);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.expense.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
