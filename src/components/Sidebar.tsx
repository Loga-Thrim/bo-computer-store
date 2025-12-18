"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Package, DollarSign, LogOut, LayoutDashboard, PieChart } from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "หน้าแรก", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "สินค้า", icon: Package },
  { href: "/dashboard/summary", label: "สรุป", icon: PieChart },
  { href: "/dashboard/price-list", label: "ราคา", icon: DollarSign },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 z-50 md:relative md:border-t-0 md:border-r md:border-gray-100 md:w-64 md:min-h-screen md:p-4 md:bg-gradient-to-b md:from-gray-50 md:to-white">
      <div className="hidden md:block mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25">
            BO
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">BO Computer</h1>
            <p className="text-xs text-gray-500">Back Office System</p>
          </div>
        </div>
      </div>

      <div className="flex justify-around md:flex-col md:space-y-1 py-2 md:py-0">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all text-xs md:text-sm font-medium ${
                isActive
                  ? "text-blue-600 md:bg-gradient-to-r md:from-blue-500/10 md:to-indigo-500/10 md:text-blue-700"
                  : "text-gray-500 md:text-gray-600 md:hover:bg-gray-100/80"
              }`}
            >
              <item.icon size={22} className={`md:w-5 md:h-5 ${isActive ? 'md:text-blue-600' : ''}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="hidden md:block mt-auto pt-8">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-all text-sm font-medium w-full"
        >
          <LogOut size={20} />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </nav>
  );
}
