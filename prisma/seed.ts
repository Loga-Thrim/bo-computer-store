import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const products = [
  { name: "RAM DDR4 8GB Kingston", buyPrice: 650, sellPrice: 850, status: "sold" },
  { name: "RAM DDR4 16GB Corsair", buyPrice: 1200, sellPrice: 1500, status: "sold" },
  { name: "RAM DDR4 8GB G.Skill", buyPrice: 600, sellPrice: 800, status: "in_stock" },
  { name: "SSD 256GB Samsung 870 EVO", buyPrice: 1100, sellPrice: 1400, status: "sold" },
  { name: "SSD 512GB Kingston A400", buyPrice: 1300, sellPrice: 1650, status: "in_stock" },
  { name: "SSD 1TB Crucial MX500", buyPrice: 2500, sellPrice: 3200, status: "sold" },
  { name: "HDD 1TB Seagate Barracuda", buyPrice: 1100, sellPrice: 1400, status: "in_stock" },
  { name: "HDD 2TB WD Blue", buyPrice: 1800, sellPrice: 2300, status: "sold" },
  { name: "GPU GTX 1650 4GB", buyPrice: 4500, sellPrice: 5500, status: "sold" },
  { name: "GPU RTX 3060 12GB", buyPrice: 9500, sellPrice: 11500, status: "in_stock" },
  { name: "GPU RX 6600 8GB", buyPrice: 7500, sellPrice: 9000, status: "sold" },
  { name: "CPU Intel i5-12400F", buyPrice: 4800, sellPrice: 5800, status: "sold" },
  { name: "CPU Intel i7-12700K", buyPrice: 11000, sellPrice: 13000, status: "in_stock" },
  { name: "CPU AMD Ryzen 5 5600X", buyPrice: 5500, sellPrice: 6800, status: "sold" },
  { name: "Mainboard ASUS B660M-K", buyPrice: 2800, sellPrice: 3500, status: "in_stock" },
  { name: "Mainboard Gigabyte B550M", buyPrice: 3200, sellPrice: 4000, status: "sold" },
  { name: "PSU Corsair 550W 80+ Bronze", buyPrice: 1500, sellPrice: 1900, status: "in_stock" },
  { name: "PSU Seasonic 650W 80+ Gold", buyPrice: 2500, sellPrice: 3100, status: "sold" },
  { name: "Case NZXT H510", buyPrice: 2200, sellPrice: 2800, status: "in_stock" },
  { name: "Case Thermaltake V200", buyPrice: 1400, sellPrice: 1800, status: "sold" },
  { name: "Monitor Dell 24\" FHD", buyPrice: 4500, sellPrice: 5500, status: "sold" },
  { name: "Monitor LG 27\" 144Hz", buyPrice: 6500, sellPrice: 8000, status: "in_stock" },
  { name: "Keyboard Logitech G213", buyPrice: 1200, sellPrice: 1500, status: "sold" },
  { name: "Mouse Razer DeathAdder", buyPrice: 1400, sellPrice: 1800, status: "in_stock" },
  { name: "Headset HyperX Cloud II", buyPrice: 2200, sellPrice: 2800, status: "sold" },
  { name: "Webcam Logitech C920", buyPrice: 2500, sellPrice: 3200, status: "in_stock" },
  { name: "RAM DDR5 16GB Kingston", buyPrice: 2200, sellPrice: 2800, status: "in_stock" },
  { name: "SSD NVMe 500GB WD Black", buyPrice: 2000, sellPrice: 2500, status: "broken" },
  { name: "CPU AMD Ryzen 7 5800X", buyPrice: 9500, sellPrice: 11500, status: "in_stock" },
  { name: "GPU RTX 4060 8GB", buyPrice: 11000, sellPrice: 13500, status: "in_stock" },
];

async function main() {
  console.log("Seeding products...");
  
  for (const p of products) {
    const profit = p.sellPrice - p.buyPrice;
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    await prisma.product.create({
      data: {
        name: p.name,
        buyPrice: p.buyPrice,
        sellPrice: p.sellPrice,
        profit: profit,
        status: p.status,
        date: date,
        serialNumber: `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      },
    });
    console.log(`Created: ${p.name}`);
  }
  
  console.log("\n✅ Created 30 products!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
