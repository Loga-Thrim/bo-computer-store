"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Trash2, Edit, X } from "lucide-react";

interface PriceItem {
  id: string;
  name: string;
  category: string | null;
  price: number;
  note: string | null;
}

const categories = [
  "RAM",
  "CPU",
  "GPU",
  "SSD/HDD",
  "Motherboard",
  "PSU",
  "Monitor",
  "อื่นๆ",
];

export default function PriceListPage() {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const fetchItems = async () => {
    const res = await fetch("/api/price-list");
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันการลบ?")) return;
    await fetch(`/api/price-list/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const filteredItems = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !filterCategory || item.category === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">ราคากลาง</h1>
        <button
          onClick={() => { setEditingItem(null); setShowForm(true); }}
          className="flex items-center gap-2 px-3 py-2 md:px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm md:text-base"
        >
          <Plus size={18} /> <span className="hidden sm:inline">เพิ่ม</span>รายการ
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm"
          >
            <option value="">ทุกหมวดหมู่</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {item.category || "ไม่ระบุ"}
                </span>
                <h3 className="text-gray-800 font-medium mt-2 truncate">{item.name}</h3>
                <p className="text-xl md:text-2xl font-bold text-green-600 mt-1">
                  ฿{item.price.toLocaleString()}
                </p>
                {item.note && (
                  <p className="text-xs md:text-sm text-gray-500 mt-2 line-clamp-2">{item.note}</p>
                )}
              </div>
              <div className="flex gap-2 ml-2">
                <button
                  onClick={() => { setEditingItem(item); setShowForm(true); }}
                  className="p-2 text-gray-400 hover:text-blue-600 active:bg-blue-50 rounded-lg transition"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 active:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          ไม่พบรายการ
        </div>
      )}

      {showForm && (
        <PriceForm
          item={editingItem}
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); fetchItems(); }}
        />
      )}
    </div>
  );
}

function PriceForm({
  item,
  onClose,
  onSave,
}: {
  item: PriceItem | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: item?.name || "",
    category: item?.category || "",
    price: item?.price?.toString() || "",
    note: item?.note || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.price) {
      alert("กรุณากรอกชื่อและราคา");
      return;
    }

    const url = item ? `/api/price-list/${item.id}` : "/api/price-list";
    const method = item ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-[60]">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md overflow-hidden md:mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {item ? "แก้ไขราคา" : "เพิ่มราคากลาง"}
          </h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-base"
              placeholder="เช่น Ram DDR4 8GB Bus 3200"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (บาท) *</label>
            <input
              type="number"
              inputMode="numeric"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-base"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-base bg-white"
            >
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
              className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:border-blue-500 outline-none resize-none text-base"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-lg transition active:bg-gray-200 font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg transition active:bg-blue-700 font-medium"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
