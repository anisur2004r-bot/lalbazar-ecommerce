import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const IMG = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70`;

const PRODUCT_IMAGES: Record<string, string[]> = {
  rice: ["photo-1586201375761-83865001e31c", "photo-1536304993881-ff9eaa7ba1aa"],
  oil: ["photo-1474919027084-26b8d4c2e7d6"],
  lentils: ["photo-1599909533730-c4e0f3a3a3a3"],
  sugar: ["photo-1611080631164-9b5e1b1f3b32"],
  salt: ["photo-1518110925495-b376d3a3a3a3"],
  flour: ["photo-1568254183919-78a4f43a1b66"],
  tea: ["photo-1597318181409-cf64d0b5d8a2", "photo-1564890369478-c89ca6d9cde9"],
  biscuits: ["photo-1558961363-fa8fdf809355", "photo-1590080875587-5b1b8b4f4f4f"],
  noodles: ["photo-1612929633738-9e1f1b1f1b1f"],
  spices: ["photo-1596040033229-a9821ebd05e5", "photo-1532336417459-2dfe9d8f1b1f"],
  milk: ["photo-1563636619-e9ffb3fb4d56"],
  eggs: ["photo-1582722872445-44dc5f7e3c8f"],
  chicken: ["photo-1603048719571-9c1b8f0f1f1f"],
  fish: ["photo-1535473895227-bdecb20fb157"],
  vegetables: ["photo-1540420773420-3366772f4999", "photo-1567327838204-9b1b1b1b1b1f"],
  fruits: ["photo-1619566636856-adf1856a9675", "photo-1571771894821-ce9b6c11b08e"],
  soap: ["photo-1600857544200-b2f666a9fe2c"],
  shampoo: ["photo-1556228720-195a672e8a03"],
  toothpaste: ["photo-1559591937-afa1b2b1b1b1f"],
  detergent: ["photo-1583947215259-8a4d1b1b1f1f"],
  phone: ["photo-1511708178613-38e2f3a3a3a3"],
  headphones: ["photo-1505740420928-5e560c81d6e5"],
  watch: ["photo-1523275335684-37898b6baf30"],
  powerbank: ["photo-1609592424821-1c8b1b1f1b1f"],
  tv: ["photo-1593359677877-a8de6684f1b1f"],
  shirt: ["photo-1602810318383-e386cc2a3ccf"],
  pants: ["photo-1542272604-787c3835535d"],
  shoes: ["photo-1542291026-7eec264c27ff"],
  bag: ["photo-1553062407-98eeb64c6a62"],
  perfume: ["photo-1541643600914-78b084683601"],
  lipstick: ["photo-1586497072340-8e0a4d1b1b1f"],
  fan: ["photo-1565374395542-0ce18882c852"],
  kettle: ["photo-1517252596838-5d4f1b1b1f1f"],
  cooker: ["photo-1585032226651-759b1b1f1b1f"],
  blanket: ["photo-1522778526097-ce0b22b1b1b1f"],
  diya: ["photo-1604336734255-2b1b1b1f1b1f"],
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

interface SeedProduct {
  name: string; nameBn?: string; categorySlug: string; description: string; shortDesc?: string;
  brand?: string; unit?: string; regularPrice: number; salePrice?: number; stock: number;
  weight?: number; imageKey: string; isFeatured?: boolean; isBestSeller?: boolean;
  isNewArrival?: boolean; isSpecialOffer?: boolean; tags?: string;
}

const CATEGORIES = [
  { name: "Grocery & Staples", nameBn: "মুদি ও প্রধান সামগ্রী", slug: "grocery", icon: "🛒", featured: true, children: [
    { name: "Rice & Rice Products", nameBn: "চাল", slug: "rice" },
    { name: "Cooking Oil & Ghee", nameBn: "রান্নার তেল ও ঘি", slug: "cooking-oil" },
    { name: "Lentils & Pulses", nameBn: "ডাল", slug: "lentils" },
    { name: "Sugar & Salt", nameBn: "চিনি ও লবণ", slug: "sugar-salt" },
    { name: "Flour & Atta", nameBn: "আটা ও ময়দা", slug: "flour" },
    { name: "Tea & Coffee", nameBn: "চা ও কফি", slug: "tea-coffee" },
    { name: "Biscuits & Snacks", nameBn: "বিস্কুট ও স্ন্যাকস", slug: "biscuits-snacks" },
    { name: "Noodles & Pasta", nameBn: "নুডলস ও পাস্তা", slug: "noodles" },
    { name: "Spices & Masala", nameBn: "মসলা", slug: "spices" },
  ]},
  { name: "Dairy & Fresh", nameBn: "ডেইরি ও তাজা", slug: "dairy-fresh", icon: "🥛", featured: true, children: [
    { name: "Milk & Dairy", nameBn: "দুধ ও ডেইরি", slug: "milk" },
    { name: "Eggs", nameBn: "ডিম", slug: "eggs" },
    { name: "Chicken & Meat", nameBn: "মুরগি ও মাংস", slug: "chicken-meat" },
    { name: "Fish & Seafood", nameBn: "মাছ", slug: "fish" },
    { name: "Vegetables", nameBn: "শাকসবজি", slug: "vegetables" },
    { name: "Fruits", nameBn: "ফল", slug: "fruits" },
  ]},
  { name: "Personal Care", nameBn: "ব্যক্তিগত যত্ন", slug: "personal-care", icon: "🧴", featured: true, children: [
    { name: "Bath & Body", nameBn: "স্নান ও শরীর", slug: "bath-body" },
    { name: "Hair Care", nameBn: "চুলের যত্ন", slug: "hair-care" },
    { name: "Oral Care", nameBn: "মুখের যত্ন", slug: "oral-care" },
  ]},
  { name: "Home & Cleaning", nameBn: "ঘর ও পরিষ্কার", slug: "home-cleaning", icon: "🧽", featured: true, children: [
    { name: "Detergents", nameBn: "ডিটারজেন্ট", slug: "detergents" },
    { name: "Fresheners", nameBn: "ফ্রেশনার", slug: "fresheners" },
  ]},
  { name: "Electronics", nameBn: "ইলেকট্রনিক্স", slug: "electronics", icon: "📱", featured: true, children: [
    { name: "Mobiles & Tablets", nameBn: "মোবাইল ও ট্যাবলেট", slug: "mobiles" },
    { name: "Audio & Headphones", nameBn: "অডিও ও হেডফোন", slug: "audio" },
    { name: "Wearables", nameBn: "ওয়্যারেবল", slug: "wearables" },
    { name: "Power & Charging", nameBn: "পাওয়ার ও চার্জিং", slug: "power" },
    { name: "TV & Home Entertainment", nameBn: "টিভি ও এন্টারটেইনমেন্ট", slug: "tv" },
  ]},
  { name: "Fashion", nameBn: "ফ্যাশন", slug: "fashion", icon: "👕", featured: true, children: [
    { name: "Men's Wear", nameBn: "পুরুষ পোশাক", slug: "mens-wear" },
    { name: "Women's Wear", nameBn: "মহিলা পোশাক", slug: "womens-wear" },
    { name: "Footwear", nameBn: "ফুটওয়্যার", slug: "footwear" },
    { name: "Bags & Accessories", nameBn: "ব্যাগ ও আনুষাঙ্গিক", slug: "bags" },
  ]},
  { name: "Beauty & Health", nameBn: "সৌন্দর্য ও স্বাস্থ্য", slug: "beauty-health", icon: "💄", featured: true, children: [
    { name: "Fragrance", nameBn: "ফ্র্যাগরেন্স", slug: "fragrance" },
    { name: "Makeup", nameBn: "মেকআপ", slug: "makeup" },
  ]},
  { name: "Home Appliances", nameBn: "হোম অ্যাপ্লায়েন্স", slug: "home-appliances", icon: "🔌", featured: false, children: [
    { name: "Kitchen Appliances", nameBn: "কিচেন অ্যাপ্লায়েন্স", slug: "kitchen-appliances" },
    { name: "Home Comfort", nameBn: "হোম কমফোর্ট", slug: "home-comfort" },
  ]},
  { name: "Home & Living", nameBn: "হোম ও লিভিং", slug: "home-living", icon: "🛋️", featured: false, children: [
    { name: "Bedding", nameBn: "বেডিং", slug: "bedding" },
    { name: "Decor", nameBn: "ডেকর", slug: "decor" },
  ]},
];

const PRODUCTS: SeedProduct[] = [
  { name: "Miniket Rice Premium 5kg", nameBn: "মিনিকেট চাল ৫ কেজি", categorySlug: "rice", description: "Premium quality Miniket rice, carefully selected and polished. Perfect for everyday meals. Long grain, fragrant and fluffy when cooked. Sourced from Bangladesh's finest rice mills.", shortDesc: "Premium long grain white rice", brand: "Pran", unit: "5 kg", regularPrice: 720, salePrice: 685, stock: 200, weight: 5, imageKey: "rice", isBestSeller: true, isFeatured: true, tags: "rice,grocery,staple" },
  { name: "Nazirshail Rice 10kg", nameBn: "নাজিরশাইল চাল ১০ কেজি", categorySlug: "rice", description: "Aromatic Nazirshail rice, perfect for biryani and polao. Aged for 1 year for the best flavor.", brand: "ACI Pure", unit: "10 kg", regularPrice: 1450, salePrice: 1380, stock: 80, weight: 10, imageKey: "rice", isBestSeller: true, tags: "rice,grocery" },
  { name: "Soyabean Oil 5 Litre", nameBn: "সয়াবিন তেল ৫ লিটার", categorySlug: "cooking-oil", description: "Refined soyabean cooking oil, cholesterol free and rich in Vitamin E. Light and healthy for daily cooking.", brand: "Fresh", unit: "5 L", regularPrice: 1180, salePrice: 1120, stock: 120, weight: 4.5, imageKey: "oil", isBestSeller: true, isFeatured: true, tags: "oil,grocery,cooking" },
  { name: "Mustard Oil Pure 1 Litre", nameBn: "সরিষার তেল ১ লিটার", categorySlug: "cooking-oil", description: "100% pure cold-pressed mustard oil from Bangladesh. Strong aroma and authentic taste.", brand: "Pran", unit: "1 L", regularPrice: 320, salePrice: 295, stock: 100, weight: 1, imageKey: "oil", tags: "oil,mustard,grocery" },
  { name: "Red Lentil (Masoor Dal) 1kg", nameBn: "মসুর ডাল ১ কেজি", categorySlug: "lentils", description: "Premium quality red lentils. Quick cooking, protein-rich, perfect for everyday dal.", brand: "ACI Pure", unit: "1 kg", regularPrice: 145, salePrice: 130, stock: 200, weight: 1, imageKey: "lentils", isFeatured: true, tags: "lentils,dal,grocery" },
  { name: "Chola Boot 1kg", nameBn: "ছোলা বুট ১ কেজি", categorySlug: "lentils", description: "Quality chola boot (chickpea lentils). Great for making dal or snacks.", unit: "1 kg", regularPrice: 120, salePrice: 110, stock: 150, weight: 1, imageKey: "lentils", tags: "lentils,grocery" },
  { name: "White Sugar 2kg", nameBn: "সাদা চিনি ২ কেজি", categorySlug: "sugar-salt", description: "Refined white sugar, perfect for tea, coffee, and cooking.", brand: "Igloo", unit: "2 kg", regularPrice: 230, stock: 300, weight: 2, imageKey: "sugar", isBestSeller: true, tags: "sugar,grocery" },
  { name: "Iodized Salt 1kg", nameBn: "আয়োডিনযুক্ত লবণ ১ কেজি", categorySlug: "sugar-salt", description: "Pure iodized salt for healthy cooking. Free flowing.", brand: "ACI Salt", unit: "1 kg", regularPrice: 38, salePrice: 35, stock: 400, weight: 1, imageKey: "salt", tags: "salt,grocery" },
  { name: "Atta Flour 5kg", nameBn: "আটা ৫ কেজি", categorySlug: "flour", description: "Whole wheat flour (atta) for soft, fluffy roti and chapati.", brand: "ACI Pure", unit: "5 kg", regularPrice: 320, salePrice: 305, stock: 200, weight: 5, imageKey: "flour", isFeatured: true, tags: "flour,atta,grocery" },
  { name: "Tea Leaves Premium 400g", nameBn: "চা পাতা ৪০০ গ্রাম", categorySlug: "tea-coffee", description: "Premium blended tea leaves for strong, aromatic tea. 400g pack.", brand: "Ispahani", unit: "400 g", regularPrice: 280, salePrice: 265, stock: 250, weight: 0.4, imageKey: "tea", isBestSeller: true, isFeatured: true, tags: "tea,grocery,beverage" },
  { name: "3D Biscuits Family Pack", nameBn: "থ্রিডি বিস্কুট ফ্যামিলি প্যাক", categorySlug: "biscuits-snacks", description: "Crunchy coconut biscuits, family pack. Loved by all ages.", brand: "Energy", unit: "300 g", regularPrice: 60, salePrice: 55, stock: 400, weight: 0.3, imageKey: "biscuits", isNewArrival: true, tags: "biscuits,snacks" },
  { name: "Instant Noodles 8 Pack", nameBn: "ইনস্ট্যান্ট নুডলস ৮ প্যাক", categorySlug: "noodles", description: "Quick cooking instant noodles, pack of 8. Tasty masala flavor.", brand: "Maggi", unit: "8 pack", regularPrice: 120, stock: 350, weight: 0.5, imageKey: "noodles", isBestSeller: true, tags: "noodles,snacks,instant" },
  { name: "Turmeric Powder 200g", nameBn: "হলুদ গুঁড়া ২০০ গ্রাম", categorySlug: "spices", description: "Pure turmeric powder, no artificial color. Adds rich color and aroma.", brand: "Pran", unit: "200 g", regularPrice: 70, salePrice: 62, stock: 300, weight: 0.2, imageKey: "spices", tags: "spices,turmeric,grocery" },
  { name: "Red Chilli Powder 200g", nameBn: "লাল মরিচ গুঁড়া ২০০ গ্রাম", categorySlug: "spices", description: "Premium red chilli powder, finely ground for that perfect heat.", brand: "Radhuni", unit: "200 g", regularPrice: 95, salePrice: 88, stock: 280, weight: 0.2, imageKey: "spices", tags: "spices,chilli,grocery" },
  { name: "Fresh Liquid Milk 1 Litre", nameBn: "তরল দুধ ১ লিটার", categorySlug: "milk", description: "Pasteurized fresh liquid milk. Rich and creamy. Best for tea, coffee, and cooking.", brand: "Milk Vita", unit: "1 L", regularPrice: 90, stock: 180, weight: 1, imageKey: "milk", isBestSeller: true, isFeatured: true, tags: "milk,dairy,fresh" },
  { name: "Farm Eggs (12 pcs)", nameBn: "ডিম ১২টি", categorySlug: "eggs", description: "Fresh farm eggs, pack of 12. High protein, nutritious.", unit: "12 pcs", regularPrice: 165, salePrice: 155, stock: 200, weight: 0.7, imageKey: "eggs", isBestSeller: true, tags: "eggs,dairy,protein" },
  { name: "Broiler Chicken 1kg", nameBn: "ব্রয়লার মুরগি ১ কেজি", categorySlug: "chicken-meat", description: "Fresh dressed broiler chicken, cleaned and ready to cook.", unit: "1 kg", regularPrice: 220, salePrice: 200, stock: 80, weight: 1, imageKey: "chicken", tags: "chicken,meat,fresh" },
  { name: "Rui Fish (Cleaned) 1kg", nameBn: "রুই মাছ ১ কেজি", categorySlug: "fish", description: "Fresh river Rui fish, cleaned and cut. Bangladeshi favorite.", unit: "1 kg", regularPrice: 380, stock: 60, weight: 1, imageKey: "fish", tags: "fish,seafood,fresh" },
  { name: "Mixed Vegetables Pack", nameBn: "মিশ্র শাকসবজি প্যাক", categorySlug: "vegetables", description: "Fresh seasonal vegetables mix - potato, tomato, onion, brinjal, pumpkin. 2kg pack.", unit: "2 kg", regularPrice: 180, salePrice: 165, stock: 100, weight: 2, imageKey: "vegetables", isNewArrival: true, isFeatured: true, tags: "vegetables,fresh" },
  { name: "Banana 1 Dozen", nameBn: "কলা ১ ডজন", categorySlug: "fruits", description: "Fresh ripe bananas, 1 dozen (12 pcs). Sweet and nutritious.", unit: "12 pcs", regularPrice: 80, stock: 150, weight: 1.5, imageKey: "fruits", isBestSeller: true, tags: "fruits,banana,fresh" },
  { name: "Apple (Premium) 1kg", nameBn: "আপেল ১ কেজি", categorySlug: "fruits", description: "Imported premium apples. Crisp, sweet and juicy.", unit: "1 kg", regularPrice: 280, salePrice: 250, stock: 100, weight: 1, imageKey: "fruits", isFeatured: true, isSpecialOffer: true, tags: "fruits,apple" },
  { name: "Bath Soap Pack of 3", nameBn: "বাথ সাবান ৩টি", categorySlug: "bath-body", description: "Moisturizing bath soap, pack of 3 bars. Gentle on skin.", brand: "Meril", unit: "3x100g", regularPrice: 120, salePrice: 105, stock: 300, weight: 0.3, imageKey: "soap", isBestSeller: true, tags: "soap,personal-care" },
  { name: "Anti-Dandruff Shampoo 340ml", nameBn: "এন্টি-ড্যানড্রাফ শ্যাম্পু ৩৪০মিলি", categorySlug: "hair-care", description: "Effective anti-dandruff shampoo with zinc pyrithione. 340ml bottle.", brand: "Head & Shoulders", unit: "340 ml", regularPrice: 480, salePrice: 425, stock: 120, weight: 0.4, imageKey: "shampoo", isFeatured: true, tags: "shampoo,hair-care" },
  { name: "Toothpaste Mint 100g", nameBn: "টুথপেস্ট ১০০ গ্রাম", categorySlug: "oral-care", description: "Mint flavored fluoride toothpaste. Protects against cavities.", brand: "Sensodyne", unit: "100 g", regularPrice: 130, salePrice: 115, stock: 280, weight: 0.1, imageKey: "toothpaste", isBestSeller: true, tags: "toothpaste,oral-care" },
  { name: "Detergent Powder 2kg", nameBn: "ডিটারজেন্ট পাউডার ২ কেজি", categorySlug: "detergents", description: "Powerful detergent powder for tough stain removal. 2kg pack.", brand: "Surf Excel", unit: "2 kg", regularPrice: 380, salePrice: 350, stock: 200, weight: 2, imageKey: "detergent", isBestSeller: true, isFeatured: true, tags: "detergent,cleaning" },
  { name: "Smartphone Galaxy A05 128GB", nameBn: "স্মার্টফোন গ্যালাক্সি A05", categorySlug: "mobiles", description: "Samsung Galaxy A05 with 128GB storage, 6GB RAM, 50MP dual camera, 5000mAh battery, 6.7-inch display. Official warranty.", brand: "Samsung", unit: "1 pc", regularPrice: 18999, salePrice: 17499, stock: 25, weight: 0.4, imageKey: "phone", isFeatured: true, isNewArrival: true, tags: "phone,smartphone,electronics,samsung" },
  { name: "Wireless Earbuds Pro", nameBn: "ওয়্যারলেস ইয়ারবাডস প্রো", categorySlug: "audio", description: "Bluetooth 5.3 wireless earbuds with active noise cancellation. 30 hour battery life with charging case.", brand: "Xiaomi", unit: "1 pc", regularPrice: 2499, salePrice: 1999, stock: 50, weight: 0.2, imageKey: "headphones", isBestSeller: true, isSpecialOffer: true, tags: "earbuds,audio,electronics" },
  { name: "Smart Watch Series 7", nameBn: "স্মার্ট ওয়াচ সিরিজ ৭", categorySlug: "wearables", description: "Fitness smart watch with heart rate, SpO2, sleep tracking, 1.8 inch display, IP68 waterproof.", brand: "Apple", unit: "1 pc", regularPrice: 8999, salePrice: 7499, stock: 30, weight: 0.3, imageKey: "watch", isFeatured: true, isNewArrival: true, tags: "watch,wearable,fitness" },
  { name: "Power Bank 20000mAh", nameBn: "পাওয়ার ব্যাংক ২০০০০mAh", categorySlug: "power", description: "Fast charging 20000mAh power bank with dual USB output, USB-C input. Charges your phone 4-5 times.", brand: "Anker", unit: "1 pc", regularPrice: 1899, salePrice: 1599, stock: 80, weight: 0.4, imageKey: "powerbank", isBestSeller: true, tags: "powerbank,charging,electronics" },
  { name: "Smart LED TV 43 inch Full HD", nameBn: "স্মার্ট এলইডি টিভি ৪৩ ইঞ্চি", categorySlug: "tv", description: "43 inch Full HD smart LED TV with Android, built-in WiFi, Netflix, YouTube. 1 year warranty.", brand: "Walton", unit: "1 pc", regularPrice: 32999, salePrice: 29999, stock: 15, weight: 10, imageKey: "tv", isFeatured: true, isSpecialOffer: true, tags: "tv,smart-tv,electronics" },
  { name: "Men's Casual Shirt - Blue", nameBn: "পুরুষদের ক্যাজুয়াল শার্ট", categorySlug: "mens-wear", description: "Premium cotton casual shirt for men. Comfortable fit, machine washable. Available in multiple sizes.", brand: "Easy", unit: "1 pc", regularPrice: 1290, salePrice: 990, stock: 60, weight: 0.3, imageKey: "shirt", isFeatured: true, isSpecialOffer: true, tags: "shirt,fashion,men" },
  { name: "Men's Denim Pants", nameBn: "পুরুষদের ডেনিম প্যান্ট", categorySlug: "mens-wear", description: "Slim fit denim jeans for men. Durable fabric, classic 5-pocket design.", brand: "Yellow", unit: "1 pc", regularPrice: 1890, salePrice: 1490, stock: 40, weight: 0.5, imageKey: "pants", isBestSeller: true, tags: "pants,denim,fashion,men" },
  { name: "Sports Running Shoes", nameBn: "স্পোর্টস রানিং শুজ", categorySlug: "footwear", description: "Lightweight running shoes with cushioned sole and breathable mesh upper. Unisex.", brand: "Bata", unit: "1 pair", regularPrice: 2499, salePrice: 1999, stock: 50, weight: 0.8, imageKey: "shoes", isBestSeller: true, isFeatured: true, tags: "shoes,footwear,fashion,sports" },
  { name: "Leather Handbag (Brown)", nameBn: "লেদার হ্যান্ডব্যাগ", categorySlug: "bags", description: "Genuine leather handbag for women. Spacious with multiple compartments. Elegant brown color.", brand: "Aarong", unit: "1 pc", regularPrice: 3490, salePrice: 2890, stock: 30, weight: 0.7, imageKey: "bag", isFeatured: true, tags: "bag,handbag,fashion,women,leather" },
  { name: "Eau de Parfum 100ml", nameBn: "ইয়া দ্য পারফিউম ১০০মিলি", categorySlug: "fragrance", description: "Long lasting eau de parfum for men. Woody and spicy notes. 100ml bottle.", brand: "AX Black", unit: "100 ml", regularPrice: 2990, salePrice: 2490, stock: 35, weight: 0.3, imageKey: "perfume", isSpecialOffer: true, isFeatured: true, tags: "perfume,beauty,fragrance" },
  { name: "Matte Lipstick Set of 6", nameBn: "ম্যাট লিপস্টিক সেট ৬টি", categorySlug: "makeup", description: "Long-lasting matte lipstick set of 6 vibrant shades. Smudge-proof and moisturizing.", brand: "MAC", unit: "6 pcs", regularPrice: 1490, salePrice: 1190, stock: 45, weight: 0.1, imageKey: "lipstick", isBestSeller: true, isNewArrival: true, tags: "lipstick,makeup,beauty" },
  { name: "Ceiling Fan with Remote", nameBn: "সিলিং ফ্যান রিমোট সহ", categorySlug: "home-comfort", description: "1200mm ceiling fan with remote control. 5 speed settings, energy efficient motor.", brand: "Walton", unit: "1 pc", regularPrice: 3490, salePrice: 2990, stock: 25, weight: 5, imageKey: "fan", isFeatured: true, tags: "fan,appliance,home" },
  { name: "Electric Kettle 1.8L", nameBn: "ইলেকট্রিক কেটলি ১.৮ লিটার", categorySlug: "kitchen-appliances", description: "Stainless steel electric kettle, 1.8 litre capacity. Fast boiling, auto shut-off.", brand: "Philips", unit: "1 pc", regularPrice: 1290, salePrice: 990, stock: 40, weight: 1, imageKey: "kettle", isBestSeller: true, isNewArrival: true, tags: "kettle,kitchen,appliance" },
  { name: "Pressure Cooker 5L", nameBn: "প্রেশার কুকার ৫ লিটার", categorySlug: "kitchen-appliances", description: "Aluminum pressure cooker 5 litre. Cooks food faster and saves energy.", brand: "Hindware", unit: "5 L", regularPrice: 1890, salePrice: 1590, stock: 30, weight: 2, imageKey: "cooker", tags: "cooker,kitchen,appliance" },
  { name: "Double Bed Blanket", nameBn: "ডাবল বেড কম্বল", categorySlug: "bedding", description: "Soft and warm double bed blanket. Perfect for winter. Anti-pilling microfiber.", brand: "Pran", unit: "1 pc", regularPrice: 1990, salePrice: 1690, stock: 35, weight: 1.5, imageKey: "blanket", isSpecialOffer: true, tags: "blanket,bedding,home" },
  { name: "Decorative Diya Set 12pcs", nameBn: "ডেকরেটিভ দিয়া সেট ১২টি", categorySlug: "decor", description: "Beautiful decorative clay diya set of 12 pieces. Perfect for festivals and home decor.", unit: "12 pcs", regularPrice: 350, salePrice: 280, stock: 80, weight: 1, imageKey: "diya", isNewArrival: true, tags: "diya,decor,home,festival" },
];

async function main() {
  console.log("Starting seed...");
  const adminPass = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({ where: { email: "admin@lalbazar.com" }, update: {}, create: { name: "LalBazar Admin", email: "admin@lalbazar.com", phone: "01700000000", passwordHash: adminPass, role: "ADMIN" } });
  console.log("Admin:", admin.email);
  const custPass = await bcrypt.hash("demo123", 10);
  const customer = await prisma.user.upsert({ where: { email: "demo@lalbazar.com" }, update: {}, create: { name: "Demo Customer", email: "demo@lalbazar.com", phone: "01711111111", passwordHash: custPass, role: "CUSTOMER" } });
  await prisma.address.upsert({ where: { id: "demo-default-address" }, update: {}, create: { id: "demo-default-address", userId: customer.id, name: "Demo Customer", phone: "01711111111", district: "Dhaka", area: "Mohammadpur", addressLine: "House 12, Road 5, Mohammadpur, Dhaka 1207", landmark: "Near Plaza Market", isDefault: true } });
  console.log("Customer:", customer.email);

  for (const cat of CATEGORIES) {
    const parent = await prisma.category.upsert({ where: { slug: cat.slug }, update: { name: cat.name, nameBn: cat.nameBn ?? null, icon: cat.icon, featured: cat.featured }, create: { name: cat.name, nameBn: cat.nameBn ?? null, slug: cat.slug, icon: cat.icon, featured: cat.featured } });
    for (const child of cat.children) {
      await prisma.category.upsert({ where: { slug: child.slug }, update: { name: child.name, nameBn: child.nameBn ?? null, parentId: parent.id }, create: { name: child.name, nameBn: child.nameBn ?? null, slug: child.slug, parentId: parent.id } });
    }
  }
  console.log("Categories:", CATEGORIES.length);

  for (const p of PRODUCTS) {
    const cat = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    if (!cat) { console.warn("Missing:", p.categorySlug); continue; }
    const images = (PRODUCT_IMAGES[p.imageKey] || [PRODUCT_IMAGES.rice[0]]).map(IMG);
    const slug = slugify(p.name);
    await prisma.product.upsert({
      where: { slug },
      update: { name: p.name, nameBn: p.nameBn ?? null, description: p.description, shortDesc: p.shortDesc ?? null, categoryId: cat.id, brand: p.brand ?? null, unit: p.unit ?? null, regularPrice: p.regularPrice, salePrice: p.salePrice ?? null, stock: p.stock, weight: p.weight ?? null, images: JSON.stringify(images), tags: p.tags ?? null, isFeatured: p.isFeatured ?? false, isBestSeller: p.isBestSeller ?? false, isNewArrival: p.isNewArrival ?? false, isSpecialOffer: p.isSpecialOffer ?? false, sku: `LB-${slug.toUpperCase().slice(0, 12)}` },
      create: { name: p.name, nameBn: p.nameBn ?? null, slug, description: p.description, shortDesc: p.shortDesc ?? null, categoryId: cat.id, brand: p.brand ?? null, unit: p.unit ?? null, regularPrice: p.regularPrice, salePrice: p.salePrice ?? null, stock: p.stock, weight: p.weight ?? null, images: JSON.stringify(images), tags: p.tags ?? null, isFeatured: p.isFeatured ?? false, isBestSeller: p.isBestSeller ?? false, isNewArrival: p.isNewArrival ?? false, isSpecialOffer: p.isSpecialOffer ?? false, sku: `LB-${slug.toUpperCase().slice(0, 12)}` },
    });
  }
  console.log("Products:", PRODUCTS.length);

  const banners = [
    { title: "Mega Grocery Sale", subtitle: "Up to 30% off on daily essentials", image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1400&q=70", link: "shop?category=grocery", buttonText: "Shop Now", position: "HERO", order: 1 },
    { title: "Fresh Fruits & Vegetables", subtitle: "Farm fresh, delivered daily", image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1400&q=70", link: "shop?category=dairy-fresh", buttonText: "Order Fresh", position: "HERO", order: 2 },
    { title: "Smart Electronics Festival", subtitle: "Latest gadgets at best prices", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1400&q=70", link: "shop?category=electronics", buttonText: "Explore", position: "HERO", order: 3 },
    { title: "Fashion Week Special", subtitle: "Style up for the season", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=70", link: "shop?category=fashion", buttonText: "Shop Fashion", position: "HERO", order: 4 },
  ];
  for (const b of banners) await prisma.banner.create({ data: b });
  console.log("Banners:", banners.length);

  const coupons = [
    { code: "WELCOME10", type: "PERCENTAGE", value: 10, minOrder: 500, maxDiscount: 200, usageLimit: 100, startDate: new Date(), endDate: new Date(Date.now() + 90 * 86400000) },
    { code: "LALBAZAR50", type: "FIXED", value: 50, minOrder: 500, usageLimit: 200, startDate: new Date(), endDate: new Date(Date.now() + 60 * 86400000) },
    { code: "MEGA100", type: "FIXED", value: 100, minOrder: 1000, usageLimit: 100, startDate: new Date(), endDate: new Date(Date.now() + 30 * 86400000) },
  ];
  for (const c of coupons) await prisma.coupon.upsert({ where: { code: c.code }, update: {}, create: c });
  console.log("Coupons:", coupons.length);

  await prisma.settings.upsert({ where: { id: "settings" }, update: {}, create: { id: "settings", siteName: "LalBazar", tagline: "Your Daily Shopping Companion", phone: "+8809613-000000", email: "support@lalbazar.com", address: "Plot 12, Block C, Gulshan-1, Dhaka 1212, Bangladesh", facebook: "https://facebook.com/lalbazar", instagram: "https://instagram.com/lalbazar", youtube: "https://youtube.com/@lalbazar", whatsapp: "+8801700000000", bkashNumber: "01700000000", nagadNumber: "01700000000", metaTitle: "LalBazar - Online Shopping in Bangladesh", metaDescription: "Shop groceries, electronics, fashion & more online with LalBazar. COD, bKash, Nagad accepted." } });
  console.log("Settings seeded");

  const teaProduct = await prisma.product.findUnique({ where: { slug: "tea-leaves-premium-400g" } });
  if (teaProduct) {
    await prisma.review.create({ data: { userId: customer.id, productId: teaProduct.id, rating: 5, comment: "Great tea, very aromatic. Will buy again." } });
    await prisma.review.create({ data: { userId: admin.id, productId: teaProduct.id, rating: 4, comment: "Good quality for the price." } });
    await prisma.product.update({ where: { id: teaProduct.id }, data: { rating: 4.5, reviewCount: 2 } });
  }
  console.log("Seed complete!");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
