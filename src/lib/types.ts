export interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "CUSTOMER" | "ADMIN";
  avatar?: string | null;
}

export interface Product {
  id: string;
  name: string;
  nameBn?: string | null;
  slug: string;
  description: string;
  shortDesc?: string | null;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  brand?: string | null;
  sku?: string | null;
  unit?: string | null;
  regularPrice: number;
  salePrice?: number | null;
  stock: number;
  weight?: number | null;
  images: string[];
  tags?: string | null;
  rating: number;
  reviewCount: number;
  soldCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isSpecialOffer: boolean;
  isActive: boolean;
}

export interface CartLine {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  regularPrice: number;
  quantity: number;
  unit?: string;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  nameBn?: string | null;
  slug: string;
  icon?: string | null;
  image?: string | null;
  parentId?: string | null;
  order: number;
  featured: boolean;
  children?: Category[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingDistrict: string;
  shippingArea: string;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  couponCode?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  unit?: string | null;
  subtotal: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  district: string;
  area: string;
  addressLine: string;
  landmark?: string | null;
  isDefault: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  image: string;
  link?: string | null;
  buttonText?: string | null;
  position: string;
  order: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Settings {
  id: string;
  siteName: string;
  tagline?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  whatsapp?: string | null;
  insideDhakaCharge: number;
  outsideDhakaCharge: number;
  freeDeliveryThreshold: number;
  bkashNumber?: string | null;
  nagadNumber?: string | null;
}
