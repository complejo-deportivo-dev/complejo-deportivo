/**
 * API Types
 * Contracts for request and response bodies.
 */

import type { 
  User, 
  UserRole, 
  Reservation, 
  ReservationStatus, 
  Service, 
  TimeSlot, 
  QrCode,
  PaymentStatus 
} from './database';

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
}

// --- Authentication ---
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  number_document?: string;
}

export interface RegisterResponse {
  user_id: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

// --- Services ---
export interface ServiceSlot {
  time_slot_id: number;
  time_start: string;
  time_end: string;
  available: boolean;
  remaining_capacity?: number;
}

// --- Reservations ---
export interface CreateReservationRequest {
  service_id: number;
  time_slot_ids: number[];
  reservation_date: string;
  quantity?: number;
  number_document?: string;
}

export interface CreateReservationResponse {
  reservation_id: number;
  expires_at: string;
  amount: number;
}

export interface ReservationWithDetails {
  reservation_id: number;
  service: {
    id: number;
    name: string;
  };
  reservation_date: string;
  slots: {
    time_slot_id: number;
    time_start: string;
    time_end: string;
  }[];
  status: ReservationStatus;
  quantity: number;
  amount: number;
  expires_at: string;
  qr_codes?: {
    qr_id: number;
    token: string;
    used: boolean;
  }[];
}

// --- Payments ---
export interface CreatePaymentIntentRequest {
  reservation_id: number;
}

export interface CreatePaymentIntentResponse {
  client_secret: string;
  amount: number;
  expires_at: string;
}

// --- Access ---
export interface ValidateQrRequest {
  token: string;
}

export interface ValidateQrResponse {
  valid: boolean;
  reservation_id: number;
  service_name: string;
  holder_name: string;
  reservation_date: string;
  time_start: string;
  time_end: string;
  quantity: number;
}

export interface ValidateDocumentRequest {
  reservation_id: number;
  number_document: string;
}

export interface ValidateDocumentResponse {
  valid: boolean;
  reservation_id: number;
  holder_name: string;
  service_name: string;
  time_start: string;
  time_end: string;
}

export interface ReentryRequest {
  reservation_id: number;
}

export interface ReentryResponse {
  valid: boolean;
  reservation_id: number;
  holder_name: string;
}

// --- Admin ---
export interface CategoryRequest {
  name: string;
}

export interface ServiceRequest {
  name: string;
  category_id: number;
  capacity: number;
  max_companions?: number;
  qr_type: 'group' | 'individual';
  hour_price: number;
  is_active?: boolean;
}

export interface TimeSlotRequest {
  service_id: number;
  time_start: string;
  time_end: string;
}

export interface EmployeeRequest {
  name: string;
  email: string;
  number_document?: string;
}

export interface AdminMetrics {
  total_reservations: number;
  by_status: Record<ReservationStatus, number>;
  total_revenue: number;
  by_service: {
    service_id: number;
    name: string;
    count: number;
    revenue: number;
  }[];
  entries: {
    granted: number;
    denied: number;
  };
}
