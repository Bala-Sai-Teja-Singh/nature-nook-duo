// ============ USER ============
export type UserRole = 'user' | 'admin';

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  addresses?: Address[];
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<User, 'password'>;

// ============ PRODUCT ============
export type MainCategory = string;

// ============ CATEGORY ============
export type CategoryFieldType = 'text' | 'select' | 'number' | 'boolean' | 'textarea' | 'multi-select';

export interface CategoryField {
  id: string;
  label: string;
  type: CategoryFieldType;
  options?: string[];
  required: boolean;
  showAsBadge: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  fields: CategoryField[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type CareLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ProductSize {
  size: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  breed: string; // Changed from scientificName
  mainCategory: MainCategory;
  careLevel: CareLevel;
  humidity: string;
  temperature: string;
  feeding: string;
  description: string;
  images: string[];
  featured: boolean;
  available: boolean;
  isVisible: boolean;
  sizes: ProductSize[];
  likes: number;

  // Generic metadata map
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customMeta?: Record<string, any>;

  createdAt: string;
  updatedAt: string;
}

export interface ProductFilter {
  mainCategory?: MainCategory;
  careLevel?: CareLevel;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
}

// ============ ORDER ============
export type OrderStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'payment_verified'
  | 'order_shipped'
  | 'order_completed'
  | 'order_cancelled';

export interface OrderItem {
  id: string; // productId
  name: string;
  image?: string;
  quantity: number;
  price: number;
  type: 'product';
  status?: OrderStatus;
  metadata?: {
    size?: string;
  };
}

// ============ SYSTEM SETTINGS ============
export interface UPIId {
  id: string;
  label: string;
  value: string;
  isDefault: boolean;
}

export interface ShippingRule {
  id: string;
  minQuantity: number;
  maxQuantity: number;
  charge: number;
}

export interface SystemSettings {
  upiIds: UPIId[];
  bankDetails: string;
  paymentInstructions: string;
  emailNotifications: {
    orderConfirmations: boolean;
    paymentVerification: boolean;
  };
  storeStatus: {
    maintenanceMode: boolean;
  };
  shippingSettings: {
    rules: ShippingRule[];
    disclaimer: string;
  };
  modules?: {
    showProducts: boolean;
    showCareGuides: boolean;
  };
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  message: string;
  status: OrderStatus;
  paymentScreenshot?: string;
  adminNote?: string;
  deliveryName: string;
  deliveryPhone: string;
  deliveryAddress: string;
  totalPrice: number;
  shippingCharge: number;
  likes: number;
  trackingId?: string;
  courierPartner?: string;
  cancellationReason?: string;
  emailsSent?: string[];
  coupon?: CouponApplied | null;
  discountAmount?: number;
  createdAt: string;
  updatedAt: string;
}

// ============ NOTIFICATION ============
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'payment' | 'order';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}

// ============ REVIEW ============
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  targetId: string;
  targetType: 'product';
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
}

// ============ CARE GUIDE ============
export interface CareGuide {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: string;
}

// ============ COUPON ============
export type DiscountType = 'percentage' | 'flat';
export type CouponApplicableTo = 'all' | 'products';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  maxUses: number;
  maxUsesPerUser: number;
  usedCount: number;
  usedBy: string[];
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableTo: CouponApplicableTo;
  applicableCategories: string[];
  excludedProductIds: string[];
  quantityDiscount: {
    enabled: boolean;
    minQuantity: number;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue: number;
  } | null;
  autoApply: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponApplied {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
}
