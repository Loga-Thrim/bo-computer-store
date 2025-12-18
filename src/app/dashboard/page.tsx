"use client";

import { useEffect, useState } from "react";
import { Package, TrendingUp, Clock, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Stats {
  total: number;
  inStock: number;
  sold: number;
  totalProfit: number;
  inStockValue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, inStock: 0, sold: 0, totalProfit: 0, inStockValue: 0 });

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((products) => {
        const total = products.length;
        const inStockProducts = products.filter((p: { status: string }) => p.status === "in_stock");
        const inStock = inStockProducts.length;
        const sold = products.filter((p: { status: string }) => p.status === "sold").length;
        const totalProfit = products
          .filter((p: { profit: number | null }) => p.profit)
          .reduce((sum: number, p: { profit: number }) => sum + p.profit, 0);
        const inStockValue = inStockProducts.reduce((sum: number, p: { buyPrice: number | null; otherCosts: number | null }) => 
          sum + (p.buyPrice || 0) + (p.otherCosts || 0), 0);
        setStats({ total, inStock, sold, totalProfit, inStockValue });
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">สวัสดี! 👋</h1>
        <p className="text-gray-500 text-sm mt-1">ยินดีต้อนรับสู่ระบบจัดการร้าน</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/20">
          <Package size={24} className="mb-2 opacity-80" />
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-sm opacity-80">สินค้าทั้งหมด</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg shadow-emerald-500/20">
          <TrendingUp size={24} className="mb-2 opacity-80" />
          <p className="text-3xl font-bold">{stats.sold}</p>
          <p className="text-sm opacity-80">ขายแล้ว</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg shadow-amber-500/20">
          <Clock size={24} className="mb-2 opacity-80" />
          <p className="text-3xl font-bold">{stats.inStock}</p>
          <p className="text-sm opacity-80">รอขาย</p>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-violet-500/20">
          <Wallet size={24} className="mb-2 opacity-80" />
          <p className="text-2xl font-bold">฿{stats.totalProfit.toLocaleString()}</p>
          <p className="text-sm opacity-80">กำไรรวม</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">มูลค่าสินค้าคงเหลือ</p>
            <p className="text-3xl font-bold mt-1">฿{stats.inStockValue.toLocaleString()}</p>
          </div>
          <Link 
            href="/dashboard/summary"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition text-sm"
          >
            ดูสรุป <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link 
          href="/dashboard/products"
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition group"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Package size={20} className="text-blue-600" />
          </div>
          <p className="font-semibold text-gray-900">จัดการสินค้า</p>
          <p className="text-xs text-gray-500 mt-1">เพิ่ม แก้ไข ลบสินค้า</p>
        </Link>

        <Link 
          href="/dashboard/summary"
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition group"
        >
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <TrendingUp size={20} className="text-emerald-600" />
          </div>
          <p className="font-semibold text-gray-900">สรุปรายรับ-จ่าย</p>
          <p className="text-xs text-gray-500 mt-1">ดูต้นทุน กำไร ค่าใช้จ่าย</p>
        </Link>
      </div>
    </div>
  );
}
