export type UserRole = 'ADMIN' | 'STORE_OWNER' | 'DRIVER'
export type OrderStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'KITCHEN_PREP' | 'READY_FOR_DELIVERY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
export type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID'
export type PaymentMethod = 'CASH' | 'DIRECT_DEBIT' | 'ONLINE'
export type ReturnStatus = 'PENDING' | 'PROCESSED'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

