import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: { date?: { gte?: Date; lte?: Date } } = {};

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const data = await request.json();

  const expense = await prisma.expense.create({
    data: {
      date: data.date ? new Date(data.date) : new Date(),
      category: data.category || "อื่นๆ",
      amount: parseFloat(data.amount) || 0,
      description: data.description || null,
    },
  });

  return NextResponse.json(expense);
}
