"use client";

import { useEffect, useState } from "react";
import { Package, TrendingUp, Clock, Wallet, ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";

interface Stats {
  total: number;
  inStock: number;
  sold: number;
  totalProfit: number;
  inStockValue: number;
  recentProducts: { id: string; name: string; status: string; profit: number | null }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ 
    total: 0, inStock: 0, sold: 0, totalProfit: 0, inStockValue: 0, recentProducts: [] 
  });

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((products) => {
        const total = products.length;
        const inStockProducts = products.filter((p: { status: string }) => p.status === "in_stock");
        const inStock = inStockProducts.length;
        const sold = products.filter((p: { status: string }) => p.status === "sold").length;
        const totalProfit = products
          .filter((p: { status: string; profit: number | null }) => p.status === "sold" && p.profit)
          .reduce((sum: number, p: { profit: number }) => sum + p.profit, 0);
        const inStockValue = inStockProducts.reduce((sum: number, p: { buyPrice: number | null; otherCosts: number | null }) => 
          sum + (p.buyPrice || 0) + (p.otherCosts || 0), 0);
        const recentProducts = products.slice(0, 5);
        setStats({ total, inStock, sold, totalProfit, inStockValue, recentProducts });
      });
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">ภาพรวม</h1>
        <p className="text-gray-500 text-sm">Bo Computer Store</p>
      </div>

      {/* Profit Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">กำไรจากการขาย</p>
            <p className="text-3xl font-bold mt-1">฿{stats.totalProfit.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet size={24} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
          <Package size={20} className="text-blue-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">ทั้งหมด</p>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
          <Clock size={20} className="text-amber-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{stats.inStock}</p>
          <p className="text-xs text-gray-500">รอขาย</p>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
          <TrendingUp size={20} className="text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{stats.sold}</p>
          <p className="text-xs text-gray-500">ขายแล้ว</p>
        </div>
      </div>

      {/* Stock Value */}
      <div className="bg-slate-800 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">มูลค่าสินค้าคงเหลือ</p>
            <p className="text-2xl font-bold mt-1">฿{stats.inStockValue.toLocaleString()}</p>
          </div>
          <Link 
            href="/dashboard/summary"
            className="flex items-center gap-1 px-3 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition"
          >
            ดูสรุป <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Products */}
      {stats.recentProducts.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">รายการล่าสุด</h2>
            <Link href="/dashboard/products" className="text-sm text-blue-600">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="space-y-2">
            {stats.recentProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    product.status === "sold" ? "bg-emerald-500" : 
                    product.status === "in_stock" ? "bg-amber-500" : "bg-rose-500"
                  }`}></div>
                  <span className="text-sm text-gray-700 truncate max-w-[200px]">{product.name}</span>
                </div>
                {product.profit && product.status === "sold" && (
                  <span className="text-sm font-medium text-emerald-600">+฿{product.profit.toLocaleString()}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link 
          href="/dashboard/products"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-blue-200 transition active:scale-[0.98]"
        >
          <Package size={24} className="text-blue-500 mb-2" />
          <p className="font-medium text-gray-900">จัดการสินค้า</p>
          <p className="text-xs text-gray-500 mt-0.5">เพิ่ม แก้ไข ลบ</p>
        </Link>

        <Link 
          href="/dashboard/summary"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-emerald-200 transition active:scale-[0.98]"
        >
          <BarChart3 size={24} className="text-emerald-500 mb-2" />
          <p className="font-medium text-gray-900">สรุปรายรับ-จ่าย</p>
          <p className="text-xs text-gray-500 mt-0.5">ต้นทุน กำไร</p>
        </Link>
      </div>
    </div>
  );
}
