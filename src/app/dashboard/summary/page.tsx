"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingUp, TrendingDown, Wallet, Package, DollarSign, Fuel, Wrench, MoreHorizontal, Plus, X, Trash2, Edit3, Save, Calculator } from "lucide-react";

interface Summary {
  totalCost: number;
  totalSales: number;
  totalProfit: number;
  totalExpenses: number;
  netProfit: number;
  inStockValue: number;
  soldCount: number;
  inStockCount: number;
}

interface FinancialRecord {
  totalCost: number;
  totalProfit: number;
  balance: number;
  note: string;
}

interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string | null;
}

const expenseCategories = [
  { value: "fuel", label: "ค่าน้ำมัน", icon: Fuel, color: "text-orange-500" },
  { value: "repair", label: "ค่าซ่อม", icon: Wrench, color: "text-blue-500" },
  { value: "other", label: "อื่นๆ", icon: MoreHorizontal, color: "text-gray-500" },
];

export default function SummaryPage() {
  const [summary, setSummary] = useState<Summary>({
    totalCost: 0,
    totalSales: 0,
    totalProfit: 0,
    totalExpenses: 0,
    netProfit: 0,
    inStockValue: 0,
    soldCount: 0,
    inStockCount: 0,
  });
  const [financial, setFinancial] = useState<FinancialRecord>({
    totalCost: 0,
    totalProfit: 0,
    balance: 0,
    note: "",
  });
  const [isEditingFinancial, setIsEditingFinancial] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const fetchData = useCallback(async () => {
    const [year, month] = filterMonth.split("-");
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const [productsRes, allProductsRes, expensesRes, financialRes] = await Promise.all([
      fetch(`/api/products?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&dateField=updatedAt`),
      fetch(`/api/products`),
      fetch(`/api/expenses?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
      fetch(`/api/financial?month=${filterMonth}`),
    ]);

    const products = await productsRes.json();
    const allProducts = await allProductsRes.json();
    const expensesData = await expensesRes.json();
    const financialData = await financialRes.json();

    setExpenses(expensesData);
    setFinancial({
      totalCost: financialData.totalCost || 0,
      totalProfit: financialData.totalProfit || 0,
      balance: financialData.balance || 0,
      note: financialData.note || "",
    });

    const soldProducts = products.filter((p: { status: string }) => p.status === "sold");
    const allInStockProducts = allProducts.filter((p: { status: string }) => p.status === "in_stock");

    const totalCost = soldProducts.reduce((sum: number, p: { buyPrice: number | null; otherCosts: number | null }) => 
      sum + (p.buyPrice || 0) + (p.otherCosts || 0), 0);
    const totalSales = soldProducts.reduce((sum: number, p: { sellPrice: number | null }) => 
      sum + (p.sellPrice || 0), 0);
    const totalProfit = soldProducts.reduce((sum: number, p: { profit: number | null }) => 
      sum + (p.profit || 0), 0);
    const totalExpenses = expensesData.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
    const inStockValue = allInStockProducts.reduce((sum: number, p: { buyPrice: number | null; otherCosts: number | null }) => 
      sum + (p.buyPrice || 0) + (p.otherCosts || 0), 0);

    setSummary({
      totalCost,
      totalSales,
      totalProfit,
      totalExpenses,
      netProfit: totalProfit - totalExpenses,
      inStockValue,
      soldCount: soldProducts.length,
      inStockCount: allInStockProducts.length,
    });
  }, [filterMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveFinancial = async () => {
    await fetch("/api/financial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: filterMonth, ...financial }),
    });
    setIsEditingFinancial(false);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("ยืนยันการลบ?")) return;
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">สรุปรายรับ-รายจ่าย</h1>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} />
            <span className="text-sm opacity-90">ยอดขาย</span>
          </div>
          <p className="text-2xl font-bold">฿{summary.totalSales.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-1">{summary.soldCount} รายการ</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} />
            <span className="text-sm opacity-90">กำไรจากสินค้า</span>
          </div>
          <p className="text-2xl font-bold">฿{summary.totalProfit.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-1">ต้นทุน ฿{summary.totalCost.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-4 text-white shadow-lg shadow-rose-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={20} />
            <span className="text-sm opacity-90">ค่าใช้จ่ายอื่น</span>
          </div>
          <p className="text-2xl font-bold">฿{summary.totalExpenses.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-1">{expenses.length} รายการ</p>
        </div>

        <div className={`rounded-2xl p-4 text-white shadow-lg ${summary.netProfit >= 0 ? 'bg-gradient-to-br from-violet-500 to-violet-600 shadow-violet-500/20' : 'bg-gradient-to-br from-gray-600 to-gray-700 shadow-gray-500/20'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={20} />
            <span className="text-sm opacity-90">กำไรสุทธิ</span>
          </div>
          <p className="text-2xl font-bold">฿{summary.netProfit.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-1">หลังหักค่าใช้จ่าย</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 rounded-xl text-white">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-amber-700">สินค้าคงเหลือ (คำนวณจากระบบ)</p>
            <p className="text-2xl font-bold text-amber-900">฿{summary.inStockValue.toLocaleString()}</p>
            <p className="text-xs text-amber-600">{summary.inStockCount} ชิ้น</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator size={20} />
            <h2 className="font-bold">บันทึกยอดเงิน (กรอกเอง)</h2>
          </div>
          {isEditingFinancial ? (
            <button
              onClick={saveFinancial}
              className="flex items-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-medium transition active:scale-95"
            >
              <Save size={16} /> บันทึก
            </button>
          ) : (
            <button
              onClick={() => setIsEditingFinancial(true)}
              className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition"
            >
              <Edit3 size={16} /> แก้ไข
            </button>
          )}
        </div>

        {isEditingFinancial ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">ต้นทุนรวม</label>
              <input
                type="number"
                inputMode="numeric"
                value={financial.totalCost || ""}
                onChange={(e) => setFinancial({ ...financial, totalCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-lg font-bold outline-none focus:border-blue-400"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">กำไรรวม</label>
              <input
                type="number"
                inputMode="numeric"
                value={financial.totalProfit || ""}
                onChange={(e) => setFinancial({ ...financial, totalProfit: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-lg font-bold outline-none focus:border-blue-400"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">ยอดเงินคงเหลือ</label>
              <input
                type="number"
                inputMode="numeric"
                value={financial.balance || ""}
                onChange={(e) => setFinancial({ ...financial, balance: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-lg font-bold outline-none focus:border-blue-400"
                placeholder="0"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs text-slate-400 mb-1">หมายเหตุ</label>
              <input
                type="text"
                value={financial.note}
                onChange={(e) => setFinancial({ ...financial, note: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-blue-400"
                placeholder="บันทึกเพิ่มเติม..."
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-xl">
              <p className="text-xs text-slate-400">ต้นทุนรวม</p>
              <p className="text-xl font-bold text-rose-400">฿{financial.totalCost.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-xl">
              <p className="text-xs text-slate-400">กำไรรวม</p>
              <p className="text-xl font-bold text-emerald-400">฿{financial.totalProfit.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-xl">
              <p className="text-xs text-slate-400">ยอดคงเหลือ</p>
              <p className="text-xl font-bold text-blue-400">฿{financial.balance.toLocaleString()}</p>
            </div>
            {financial.note && (
              <div className="col-span-3 text-sm text-slate-400 bg-white/5 rounded-xl px-3 py-2">
                📝 {financial.note}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">ค่าใช้จ่ายอื่นๆ</h2>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25 active:scale-95 transition"
          >
            <Plus size={16} /> เพิ่ม
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            ไม่มีค่าใช้จ่ายในเดือนนี้
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {expenses.map((expense) => {
              const cat = expenseCategories.find((c) => c.value === expense.category) || expenseCategories[2];
              const Icon = cat.icon;
              return (
                <div key={expense.id} className="flex items-center gap-3 p-4">
                  <div className={`p-2 rounded-xl bg-gray-50 ${cat.color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{cat.label}</p>
                    {expense.description && (
                      <p className="text-sm text-gray-500 truncate">{expense.description}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(expense.date).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-600">-฿{expense.amount.toLocaleString()}</p>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-gray-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showExpenseForm && (
        <ExpenseForm
          onClose={() => setShowExpenseForm(false)}
          onSave={() => { setShowExpenseForm(false); fetchData(); }}
        />
      )}
    </div>
  );
}

function ExpenseForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "fuel",
    amount: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount) return;

    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[60]">
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-md overflow-hidden md:mx-4 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">เพิ่มค่าใช้จ่าย</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">ประเภท</label>
            <div className="grid grid-cols-3 gap-2">
              {expenseCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.value })}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition ${
                      form.category === cat.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <Icon size={24} className={cat.color} />
                    <span className="text-xs font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">จำนวนเงิน</label>
            <input
              type="number"
              inputMode="numeric"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold text-center"
              placeholder="0"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">วันที่</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">รายละเอียด</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base"
              placeholder="เช่น เติมน้ำมันไปรับของ"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3.5 text-gray-600 bg-gray-100 rounded-xl transition active:scale-95 font-semibold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl transition active:scale-95 font-semibold shadow-lg shadow-blue-500/25"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
