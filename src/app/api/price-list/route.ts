import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const priceList = await prisma.priceList.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(priceList);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    const item = await prisma.priceList.create({
      data: {
        name: data.name,
        category: data.category || null,
        price: parseFloat(data.price),
        note: data.note || null,
      },
    });

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Failed to create price item" }, { status: 500 });
  }
}
