import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const status = searchParams.get("status");
  const dateField = searchParams.get("dateField") || "date"; // "date" or "updatedAt"

  const where: Record<string, unknown> = {};

  if (startDate && endDate) {
    where[dateField] = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  if (status) {
    where.status = status;
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: [
      { status: "asc" },
      { updatedAt: "desc" },
    ],
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    const buyPrice = data.buyPrice ? parseFloat(data.buyPrice) : null;
    const sellPrice = data.sellPrice ? parseFloat(data.sellPrice) : null;
    const otherCosts = data.otherCosts ? parseFloat(data.otherCosts) : null;
    const totalCost = (buyPrice || 0) + (otherCosts || 0);
    const profit = sellPrice ? sellPrice - totalCost : null;

    const product = await prisma.product.create({
      data: {
        date: data.date ? new Date(data.date) : null,
        name: data.name || null,
        image: data.image || null,
        serialNumber: data.serialNumber || null,
        buyPrice,
        sellPrice,
        otherCosts,
        profit,
        warrantyStart: data.warrantyStart ? new Date(data.warrantyStart) : null,
        warrantyEnd: data.warrantyEnd ? new Date(data.warrantyEnd) : null,
        buyReceiptImage: data.buyReceiptImage || null,
        sellReceiptImage: data.sellReceiptImage || null,
        depositReceiptImage: data.depositReceiptImage || null,
        status: data.status || "in_stock",
        note: data.note || null,
      },
    });

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
