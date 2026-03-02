// Inventory Types based on Real Estate Backend API

// ==================== ENUMS ====================

export enum UnitStatusEnum {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  BOOKED = 'BOOKED',
  REGISTERED = 'REGISTERED',
  SOLD = 'SOLD',
  BLOCKED = 'BLOCKED',
}

export enum BHKTypeEnum {
  STUDIO = 'STUDIO',
  '1BHK' = '1BHK',
  '1.5BHK' = '1.5BHK',
  '2BHK' = '2BHK',
  '2.5BHK' = '2.5BHK',
  '3BHK' = '3BHK',
  '4BHK' = '4BHK',
  PENTHOUSE = 'PENTHOUSE',
  VILLA = 'VILLA',
  PLOT = 'PLOT',
  COMMERCIAL = 'COMMERCIAL',
}

export enum FacingEnum {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  WEST = 'WEST',
  NORTH_EAST = 'NORTH_EAST',
  NORTH_WEST = 'NORTH_WEST',
  SOUTH_EAST = 'SOUTH_EAST',
  SOUTH_WEST = 'SOUTH_WEST',
}

export const UNIT_STATUS_COLORS: Record<UnitStatusEnum, string> = {
  [UnitStatusEnum.AVAILABLE]: '#22C55E',
  [UnitStatusEnum.RESERVED]: '#F59E0B',
  [UnitStatusEnum.BOOKED]: '#3B82F6',
  [UnitStatusEnum.REGISTERED]: '#8B5CF6',
  [UnitStatusEnum.SOLD]: '#6B7280',
  [UnitStatusEnum.BLOCKED]: '#EF4444',
};

export const UNIT_STATUS_LABELS: Record<UnitStatusEnum, string> = {
  [UnitStatusEnum.AVAILABLE]: 'Available',
  [UnitStatusEnum.RESERVED]: 'Reserved',
  [UnitStatusEnum.BOOKED]: 'Booked',
  [UnitStatusEnum.REGISTERED]: 'Registered',
  [UnitStatusEnum.SOLD]: 'Sold',
  [UnitStatusEnum.BLOCKED]: 'Blocked',
};

export const BHK_TYPE_OPTIONS = [
  'STUDIO', '1BHK', '1.5BHK', '2BHK', '2.5BHK', '3BHK', '4BHK',
  'PENTHOUSE', 'VILLA', 'PLOT', 'COMMERCIAL',
] as const;

export const FACING_OPTIONS = [
  'NORTH', 'SOUTH', 'EAST', 'WEST',
  'NORTH_EAST', 'NORTH_WEST', 'SOUTH_EAST', 'SOUTH_WEST',
] as const;

// ==================== INTERFACES ====================

export interface Project {
  id: number;
  tenant_id?: string;
  name: string;
  rera_number?: string;
  description?: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  google_maps_url?: string;
  total_units: number;
  launch_date?: string;
  possession_date?: string;
  logo_url?: string;
  banner_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tower {
  id: number;
  project: number;
  project_name?: string;
  name: string;
  total_floors: number;
  units_per_floor: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Unit {
  id: number;
  tower: number;
  tower_name?: string;
  project_name?: string;
  unit_number: string;
  floor_number: number;
  bhk_type: string;
  carpet_area?: string;
  built_up_area?: string;
  super_built_up_area?: string;
  facing?: string;
  base_price?: string;
  floor_rise_premium?: string;
  facing_premium?: string;
  parking_charges?: string;
  other_charges?: string;
  total_price?: string;
  status: UnitStatusEnum;
  reserved_for_lead_id?: number | null;
  reserved_for_lead_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UnitGridUnit {
  id: number;
  unit_number: string;
  floor_number: number;
  bhk_type: string;
  carpet_area: string;
  facing?: string;
  total_price: string;
  status: UnitStatusEnum;
  reserved_for_lead_id: number | null;
}

export interface UnitGridFloor {
  floor_number: number;
  units: UnitGridUnit[];
}

export interface UnitGridResponse {
  tower_id: number;
  tower_name: string;
  grid: UnitGridFloor[];
}

export interface InventorySummary {
  project_id: number;
  project_name: string;
  total: number;
  available: number;
  reserved: number;
  booked: number;
  registered: number;
  sold: number;
  blocked: number;
}

export interface PriceCalculation {
  base_price: string;
  floor_rise_premium: string;
  facing_premium: string;
  parking_charges: string;
  other_charges: string;
  total_price: string;
}

export interface UnitSuggestion extends Unit {
  match_score?: number;
}

// ==================== API PAYLOADS ====================

export interface CreateProjectPayload {
  name: string;
  rera_number?: string;
  description?: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  google_maps_url?: string;
  total_units?: number;
  launch_date?: string;
  possession_date?: string;
  logo_url?: string;
  banner_url?: string;
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export interface CreateTowerPayload {
  project: number;
  name: string;
  total_floors: number;
  units_per_floor: number;
  description?: string;
}

export type UpdateTowerPayload = Partial<CreateTowerPayload>;

export interface CreateUnitPayload {
  tower: number;
  unit_number: string;
  floor_number: number;
  bhk_type: string;
  carpet_area?: string;
  built_up_area?: string;
  super_built_up_area?: string;
  facing?: string;
  base_price?: string;
  floor_rise_premium?: string;
  facing_premium?: string;
  parking_charges?: string;
  other_charges?: string;
}

export type UpdateUnitPayload = Partial<CreateUnitPayload>;

export interface ReserveUnitPayload {
  lead_id: number;
}

export interface UpdateUnitStatusPayload {
  status: UnitStatusEnum;
}

export interface PriceCalculatorPayload {
  base_price: string;
  floor_rise_premium?: string;
  facing_premium?: string;
  parking_charges?: string;
  other_charges?: string;
}

// ==================== QUERY PARAMS ====================

export interface ProjectsQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  city?: string;
}

export interface TowersQueryParams {
  page?: number;
  page_size?: number;
  project?: number;
  search?: string;
  ordering?: string;
}

export interface UnitsQueryParams {
  page?: number;
  page_size?: number;
  tower?: number;
  status?: UnitStatusEnum;
  bhk_type?: string;
  floor_number__gte?: number;
  floor_number__lte?: number;
  base_price__lte?: number;
  search?: string;
  ordering?: string;
}

export interface UnitSuggestParams {
  lead_id: number;
  project_id?: number;
}

// ==================== API RESPONSES ====================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ProjectsResponse = PaginatedResponse<Project>;
export type TowersResponse = PaginatedResponse<Tower>;
export type UnitsResponse = PaginatedResponse<Unit>;
