"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Trash2, Edit, X, Upload, Image as ImageIcon, Camera, Receipt } from "lucide-react";
import Image from "next/image";

interface Product {
  id: string;
  date: string | null;
  name: string | null;
  image: string | null;
  serialNumber: string | null;
  buyPrice: number | null;
  sellPrice: number | null;
  otherCosts: number | null;
  profit: number | null;
  warrantyStart: string | null;
  warrantyEnd: string | null;
  buyReceiptImage: string | null;
  sellReceiptImage: string | null;
  status: string;
  note: string | null;
}

const statusOptions = [
  { value: "in_stock", label: "ยังไม่ออก", color: "bg-amber-500/10 text-amber-600 border border-amber-200" },
  { value: "sold", label: "ขายแล้ว", color: "bg-emerald-500/10 text-emerald-600 border border-emerald-200" },
  { value: "broken", label: "เสีย", color: "bg-rose-500/10 text-rose-600 border border-rose-200" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterStatus) params.append("status", filterStatus);
    if (filterMonth) {
      const [year, month] = filterMonth.split("-");
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      params.append("startDate", startDate.toISOString());
      params.append("endDate", endDate.toISOString());
    }
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data);
  }, [filterStatus, filterMonth]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันการลบ?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">สินค้า</h1>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="flex items-center gap-2 px-3 py-2 md:px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm md:text-base"
        >
          <Plus size={18} />สินค้า
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
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm"
            >
              <option value="">ทุกสถานะ</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">วันที่</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">รูป</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">สินค้า</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">SN</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">ราคาซื้อ</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">ราคาขาย</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">กำไร</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">สถานะ</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {product.date ? new Date(product.date).toLocaleDateString("th-TH") : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {product.image ? (
                      <Image 
                        src={product.image} 
                        alt="" 
                        width={40} 
                        height={40} 
                        className="w-10 h-10 object-cover rounded cursor-pointer hover:opacity-80 transition" 
                        onClick={() => setPreviewImage(product.image)}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <ImageIcon size={16} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">{product.name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{product.serialNumber || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">
                    {product.buyPrice ? `฿${product.buyPrice.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">
                    {product.sellPrice ? `฿${product.sellPrice.toLocaleString()}` : "-"}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right font-medium ${product.profit && product.profit > 0 ? "text-green-600" : "text-gray-600"}`}>
                    {product.profit ? `฿${product.profit.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusOptions.find((s) => s.value === product.status)?.color}`}>
                      {statusOptions.find((s) => s.value === product.status)?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setEditingProduct(product); setShowForm(true); }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex gap-3">
              {product.image ? (
                <Image 
                  src={product.image} 
                  alt="" 
                  width={56} 
                  height={56} 
                  className="w-14 h-14 object-cover rounded-lg shrink-0 cursor-pointer active:opacity-80" 
                  onClick={() => setPreviewImage(product.image)}
                />
              ) : (
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <ImageIcon size={20} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-gray-800 truncate">{product.name || "ไม่ระบุชื่อ"}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusOptions.find((s) => s.value === product.status)?.color}`}>
                    {statusOptions.find((s) => s.value === product.status)?.label}
                  </span>
                </div>
                {product.serialNumber && (
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{product.serialNumber}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className="text-gray-500">ซื้อ: {product.buyPrice ? `฿${product.buyPrice.toLocaleString()}` : "-"}</span>
                  <span className="text-gray-500">ขาย: {product.sellPrice ? `฿${product.sellPrice.toLocaleString()}` : "-"}</span>
                  {product.profit && product.profit > 0 && (
                    <span className="text-green-600 font-medium">+฿{product.profit.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                {product.date ? new Date(product.date).toLocaleDateString("th-TH") : "ไม่ระบุวันที่"}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => { setEditingProduct(product); setShowForm(true); }}
                  className="flex items-center gap-1 text-blue-600 text-sm"
                >
                  <Edit size={16} /> แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex items-center gap-1 text-red-500 text-sm"
                >
                  <Trash2 size={16} /> ลบ
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">ไม่พบสินค้า</div>
        )}
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); fetchProducts(); }}
        />
      )}

      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[70] p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button 
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition"
            onClick={() => setPreviewImage(null)}
          >
            <X size={28} />
          </button>
          <Image 
            src={previewImage} 
            alt="Preview" 
            width={800} 
            height={800} 
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function ProductForm({
  product,
  onClose,
  onSave,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    date: product?.date ? new Date(product.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    name: product?.name || "",
    image: product?.image || "",
    serialNumber: product?.serialNumber || "",
    buyPrice: product?.buyPrice?.toString() || "",
    sellPrice: product?.sellPrice?.toString() || "",
    otherCosts: product?.otherCosts?.toString() || "",
    warrantyStart: product?.warrantyStart ? new Date(product.warrantyStart).toISOString().split("T")[0] : "",
    warrantyEnd: product?.warrantyEnd ? new Date(product.warrantyEnd).toISOString().split("T")[0] : "",
    buyReceiptImage: product?.buyReceiptImage || "",
    sellReceiptImage: product?.sellReceiptImage || "",
    status: product?.status || "in_stock",
    note: product?.note || "",
  });
  const [uploading, setUploading] = useState<string | null>(null);

  const compressImage = (file: File, maxSizeMB: number = 2): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          
          // Resize if too large
          const maxDimension = 1920;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress with quality adjustment
          let quality = 0.8;
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (blob && blob.size > maxSizeMB * 1024 * 1024 && quality > 0.3) {
                  quality -= 0.1;
                  tryCompress();
                } else if (blob) {
                  resolve(new File([blob], file.name, { type: "image/jpeg" }));
                } else {
                  resolve(file);
                }
              },
              "image/jpeg",
              quality
            );
          };
          tryCompress();
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field);
    
    // Always compress images for faster upload and smaller storage
    const processedFile = file.type.startsWith("image/") 
      ? await compressImage(file, 1) 
      : file;
    
    const formData = new FormData();
    formData.append("file", processedFile);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (data.url) {
      setForm((prev) => ({ ...prev, [field]: data.url }));
    }
    setUploading(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    onSave();
  };

  const calculatedProfit = () => {
    const buy = parseFloat(form.buyPrice) || 0;
    const sell = parseFloat(form.sellPrice) || 0;
    const other = parseFloat(form.otherCosts) || 0;
    return sell - buy - other;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[60]">
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-lg overflow-hidden md:mx-4 shadow-2xl flex flex-col" style={{ maxHeight: 'calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 20px)', height: 'auto' }}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {product ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}
          </h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5 overflow-y-auto overflow-x-hidden flex-1 overscroll-contain">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อสินค้า</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base transition"
              placeholder="เช่น Ram DDR4 16GB"
            />
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              💰 ราคาและต้นทุน
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">ราคาซื้อ</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.buyPrice}
                  onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
                  className="w-full px-3 py-3 bg-white border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base shadow-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">ค่าใช้จ่ายอื่น</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.otherCosts}
                  onChange={(e) => setForm({ ...form, otherCosts: e.target.value })}
                  className="w-full px-3 py-3 bg-white border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base shadow-sm"
                  placeholder="ค่าน้ำมัน, ค่าซ่อม"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">ราคาขาย</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.sellPrice}
                onChange={(e) => setForm({ ...form, sellPrice: e.target.value })}
                className="w-full px-3 py-3 bg-white border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base shadow-sm"
                placeholder="0"
              />
            </div>
            {(form.buyPrice || form.sellPrice) && (
              <div className={`text-center py-2 rounded-xl font-bold text-lg ${calculatedProfit() >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                กำไร: ฿{calculatedProfit().toLocaleString()}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">สถานะ</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base"
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Serial Number</label>
            <input
              type="text"
              value={form.serialNumber}
              onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-base"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">📷 รูปภาพ</label>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex flex-col items-center justify-center gap-1 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 active:scale-95 transition aspect-square">
                {form.image ? (
                  <Image src={form.image} alt="" width={64} height={64} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <>
                    <Camera size={24} className="text-gray-400" />
                    <span className="text-[10px] text-gray-500">สินค้า</span>
                  </>
                )}
                {uploading === "image" && <span className="text-[10px] text-blue-500">อัพโหลด...</span>}
                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "image")} className="hidden" />
              </label>
              <label className="flex flex-col items-center justify-center gap-1 p-3 bg-amber-50 rounded-xl cursor-pointer hover:bg-amber-100 active:scale-95 transition aspect-square">
                {form.buyReceiptImage ? (
                  <Image src={form.buyReceiptImage} alt="" width={64} height={64} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <>
                    <Receipt size={24} className="text-amber-500" />
                    <span className="text-[10px] text-amber-600">ใบเสร็จซื้อ</span>
                  </>
                )}
                {uploading === "buyReceiptImage" && <span className="text-[10px] text-blue-500">อัพโหลด...</span>}
                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "buyReceiptImage")} className="hidden" />
              </label>
              <label className="flex flex-col items-center justify-center gap-1 p-3 bg-emerald-50 rounded-xl cursor-pointer hover:bg-emerald-100 active:scale-95 transition aspect-square">
                {form.sellReceiptImage ? (
                  <Image src={form.sellReceiptImage} alt="" width={64} height={64} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <>
                    <Receipt size={24} className="text-emerald-500" />
                    <span className="text-[10px] text-emerald-600">ใบเสร็จขาย</span>
                  </>
                )}
                {uploading === "sellReceiptImage" && <span className="text-[10px] text-blue-500">อัพโหลด...</span>}
                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "sellReceiptImage")} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ประกันเริ่ม</label>
              <input
                type="date"
                value={form.warrantyStart}
                onChange={(e) => setForm({ ...form, warrantyStart: e.target.value })}
                className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ประกันหมด</label>
              <input
                type="date"
                value={form.warrantyEnd}
                onChange={(e) => setForm({ ...form, warrantyEnd: e.target.value })}
                className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">หมายเหตุ</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
              className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-base"
              placeholder="บันทึกเพิ่มเติม..."
            />
          </div>
        </form>

        <div className="p-4 border-t border-gray-100 bg-white shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3.5 text-gray-600 bg-gray-100 rounded-xl transition active:scale-95 font-semibold"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl transition active:scale-95 font-semibold shadow-lg shadow-blue-500/25"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
