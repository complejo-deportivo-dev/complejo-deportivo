/**
 * Database Types
 * Reflects the public schema of the database.
 */

export type UserRole = 'client' | 'admin' | 'employee';
export type ReservationStatus = 'pending' | 'confirmed' | 'failed' | 'expired' | 'completed';
export type QrType = 'group' | 'individual';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed';
export type AccessResult = 'granted' | 'denied';
export type EntryType = 'qr' | 'manual';

export interface User {
  id: string;
  name: string;
  email: string;
  number_document: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: number;
  name: string;
  id_category: number;
  capacity: number;
  max_companions: number;
  qr_type: QrType;
  is_active: boolean;
  hour_price: number;
  created_at: string;
}

export interface TimeSlot {
  id: number;
  id_service: number;
  time_start: string;
  time_end: string;
  created_at: string;
}

export interface Reservation {
  id: number;
  id_user: string;
  quantity: number;
  expires_at: string | null;
  status: ReservationStatus;
  created_at: string;
}

export interface ReservationSlot {
  id: number;
  id_reservation: number;
  id_time_slot: number;
  slot_date: string;
  is_active: boolean;
  created_at: string;
}

export interface Payment {
  id: number;
  id_reservation: number;
  stripe_payment_intent_id: string;
  status: PaymentStatus;
  amount: number;
  created_at: string;
}

export interface QrCode {
  id: number;
  id_reservation: number;
  token: string;
  used_at: string | null;
  used_by: string | null;
  created_at: string;
}

export interface AccessLog {
  id: number;
  id_reservation: number;
  id_employee: string;
  id_qr_code: number | null;
  entry_type: EntryType;
  result: AccessResult;
  scanned_at: string;
}
