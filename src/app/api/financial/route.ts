import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  if (!month) {
    return NextResponse.json({ error: "Month is required" }, { status: 400 });
  }

  const record = await prisma.financialRecord.findUnique({
    where: { month },
  });

  return NextResponse.json(record || { month, totalCost: 0, totalProfit: 0, balance: 0 });
}

export async function POST(request: Request) {
  const data = await request.json();

  if (!data.month) {
    return NextResponse.json({ error: "Month is required" }, { status: 400 });
  }

  const record = await prisma.financialRecord.upsert({
    where: { month: data.month },
    update: {
      totalCost: parseFloat(data.totalCost) || 0,
      totalProfit: parseFloat(data.totalProfit) || 0,
      balance: parseFloat(data.balance) || 0,
      note: data.note || null,
    },
    create: {
      month: data.month,
      totalCost: parseFloat(data.totalCost) || 0,
      totalProfit: parseFloat(data.totalProfit) || 0,
      balance: parseFloat(data.balance) || 0,
      note: data.note || null,
    },
  });

  return NextResponse.json(record);
}
