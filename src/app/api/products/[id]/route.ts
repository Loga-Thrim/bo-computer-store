import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await request.json();

    const buyPrice = data.buyPrice ? parseFloat(data.buyPrice) : null;
    const sellPrice = data.sellPrice ? parseFloat(data.sellPrice) : null;
    const otherCosts = data.otherCosts ? parseFloat(data.otherCosts) : null;
    const totalCost = (buyPrice || 0) + (otherCosts || 0);
    const profit = sellPrice ? sellPrice - totalCost : null;

    const product = await prisma.product.update({
      where: { id },
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
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
