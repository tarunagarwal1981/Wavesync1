// ============================================================================
// WAVESYNC MARITIME PLATFORM - COMPREHENSIVE TYPE SYSTEM
// ============================================================================

// ============================================================================
// ENUMS - Status and Type Definitions
// ============================================================================

export enum UserRole {
  SEAFARER = 'seafarer',
  COMPANY_USER = 'company_user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  BLACKLISTED = 'blacklisted'
}

export enum AssignmentStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  TERMINATED = 'terminated'
}

export enum DocumentType {
  PASSPORT = 'passport',
  SEAMAN_BOOK = 'seaman_book',
  MEDICAL_CERTIFICATE = 'medical_certificate',
  STCW_CERTIFICATE = 'stcw_certificate',
  VISA = 'visa',
  VACCINATION_CERTIFICATE = 'vaccination_certificate',
  TRAINING_CERTIFICATE = 'training_certificate',
  ENG1_MEDICAL = 'eng1_medical',
  ENG11_MEDICAL = 'eng11_medical',
  COC_CERTIFICATE = 'coc_certificate',
  COP_CERTIFICATE = 'cop_certificate',
  GMDSS_CERTIFICATE = 'gmdss_certificate',
  RADAR_CERTIFICATE = 'radar_certificate',
  ARPA_CERTIFICATE = 'arpa_certificate',
  OTHER = 'other'
}

export enum DocumentStatus {
  VALID = 'valid',
  EXPIRING_SOON = 'expiring_soon',
  EXPIRED = 'expired',
  PENDING_VERIFICATION = 'pending_verification',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum VesselType {
  CARGO = 'cargo',
  TANKER = 'tanker',
  CONTAINER = 'container',
  BULK_CARRIER = 'bulk_carrier',
  LNG = 'lng',
  LPG = 'lpg',
  CRUISE = 'cruise',
  FERRY = 'ferry',
  FISHING = 'fishing',
  OFFSHORE = 'offshore',
  DREDGER = 'dredger',
  TUG = 'tug',
  SUPPLY_VESSEL = 'supply_vessel',
  OTHER = 'other'
}

export enum VesselStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  DRY_DOCK = 'dry_dock',
  SCRAPPED = 'scrapped'
}

export enum TrainingStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  FAILED = 'failed',
  SUSPENDED = 'suspended'
}

export enum NotificationType {
  ASSIGNMENT = 'assignment',
  DOCUMENT = 'document',
  TASK = 'task',
  TRAINING = 'training',
  SYSTEM = 'system',
  REMINDER = 'reminder',
  SECURITY = 'security',
  WEATHER = 'weather',
  PORT = 'port'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum Rank {
  // Deck Department
  MASTER = 'master',
  CHIEF_OFFICER = 'chief_officer',
  SECOND_OFFICER = 'second_officer',
  THIRD_OFFICER = 'third_officer',
  BOSUN = 'bosun',
  AB_SEAMAN = 'ab_seaman',
  OS_SEAMAN = 'os_seaman',
  CADET = 'cadet',
  
  // Engine Department
  CHIEF_ENGINEER = 'chief_engineer',
  SECOND_ENGINEER = 'second_engineer',
  THIRD_ENGINEER = 'third_engineer',
  FOURTH_ENGINEER = 'fourth_engineer',
  ELECTRICIAN = 'electrician',
  WIPER = 'wiper',
  OILER = 'oiler',
  ENGINE_CADET = 'engine_cadet',
  
  // Catering Department
  CHIEF_COOK = 'chief_cook',
  COOK = 'cook',
  STEWARD = 'steward',
  
  // Other
  RADIO_OFFICER = 'radio_officer',
  PUMPMAN = 'pumpman',
  OTHER = 'other'
}

export enum Department {
  DECK = 'deck',
  ENGINE = 'engine',
  CATERING = 'catering',
  RADIO = 'radio',
  OTHER = 'other'
}

// ============================================================================
// CORE INTERFACES - User Management
// ============================================================================

export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Seafarer extends BaseUser {
  role: UserRole.SEAFARER;
  seafarerId: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  seamanBookNumber?: string;
  seamanBookExpiry?: string;
  rank: Rank;
  department: Department;
  experience: number; // years
  certifications: string[];
  languages: string[];
  emergencyContact: EmergencyContact;
  address: Address;
  bankDetails?: BankDetails;
  nextOfKin: NextOfKin;
  medicalHistory?: MedicalHistory;
  employmentHistory: EmploymentRecord[];
}

export interface CompanyUser extends BaseUser {
  role: UserRole.COMPANY_USER;
  companyId: string;
  companyName: string;
  position: string;
  department?: string;
  permissions: string[];
}

export interface Admin extends BaseUser {
  role: UserRole.ADMIN | UserRole.SUPER_ADMIN;
  permissions: string[];
  accessLevel: 'read' | 'write' | 'admin' | 'super_admin';
}

// Union type for all user types with optional properties
export type User = (Seafarer | CompanyUser | Admin) & {
  // Make all user-specific properties optional for type safety
  rank?: string;
  seafarerId?: string;
  department?: string;
  experience?: number;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  seamanBookNumber?: string;
  // Additional flexible properties for demo data
  [key: string]: any;
} | {
  // Flexible user type for demo data
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  [key: string]: any;
};

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
}

export interface NextOfKin {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address: Address;
}

export interface MedicalHistory {
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  lastMedicalCheck?: string;
}

export interface EmploymentRecord {
  vesselName: string;
  vesselType: VesselType;
  rank: Rank;
  startDate: string;
  endDate?: string;
  duration: number; // months
  company: string;
  reasonForLeaving?: string;
}

// ============================================================================
// VESSEL MANAGEMENT
// ============================================================================

export interface Vessel {
  id: string;
  name: string;
  imo: string;
  mmsi?: string;
  callSign?: string;
  type: VesselType;
  flag: string;
  portOfRegistry: string;
  grossTonnage: number;
  netTonnage: number;
  length: number;
  beam: number;
  draft: number;
  yearBuilt: number;
  builder?: string;
  engineDetails: EngineDetails;
  classificationSociety: string;
  companyId: string;
  companyName: string;
  currentLocation?: VesselLocation;
  nextPort?: PortInfo;
  status: VesselStatus;
  crewCapacity: number;
  passengerCapacity?: number;
  cargoCapacity?: number;
  specifications: VesselSpecifications;
  createdAt: string;
  updatedAt: string;
}

export interface EngineDetails {
  type: string;
  manufacturer: string;
  power: number; // kW
  fuelType: string;
  consumption: number; // liters per hour
}

export interface VesselLocation {
  latitude: number;
  longitude: number;
  port?: string;
  country?: string;
  lastUpdated: string;
}

export interface PortInfo {
  name: string;
  country: string;
  eta: string;
  etd?: string;
  berth?: string;
}

export interface VesselSpecifications {
  hullMaterial: string;
  propulsion: string;
  navigationEquipment: string[];
  communicationEquipment: string[];
  safetyEquipment: string[];
  cargoEquipment?: string[];
  specialFeatures?: string[];
}

// ============================================================================
// ASSIGNMENT MANAGEMENT
// ============================================================================

export interface Assignment {
  id: string;
  seafarerId: string;
  vesselId: string;
  vessel: Vessel;
  position: Rank;
  department: Department;
  joiningDate: string;
  signingOffDate?: string;
  contractDuration: number; // months
  salary: number;
  currency: string;
  overtimeRate?: number;
  leaveDays: number;
  status: AssignmentStatus;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  requiredDocuments: RequiredDocument[];
  mobilizationChecklist: MobilizationStep[];
  contractTerms: ContractTerms;
  benefits: Benefits;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  respondedAt?: string;
  responseMessage?: string;
}

export interface RequiredDocument {
  documentType: DocumentType;
  title: string;
  description?: string;
  mandatory: boolean;
  expiryRequired: boolean;
  minValidityDays?: number;
}

export interface MobilizationStep {
  id: string;
  title: string;
  description: string;
  order: number;
  requiredDocuments: DocumentType[];
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  assignee?: string;
}

export interface ContractTerms {
  probationPeriod?: number; // days
  noticePeriod: number; // days
  terminationClause?: string;
  disputeResolution?: string;
  governingLaw: string;
  specialConditions?: string[];
}

export interface Benefits {
  accommodation: boolean;
  meals: boolean;
  uniform: boolean;
  transportation: boolean;
  medicalInsurance: boolean;
  lifeInsurance?: boolean;
  pensionContribution?: boolean;
  bonus?: number;
  otherBenefits?: string[];
}

export interface AssignmentResponse {
  assignmentId: string;
  seafarerId: string;
  response: 'accept' | 'decline';
  message?: string;
  respondedAt: string;
  conditions?: string[];
}

// ============================================================================
// DOCUMENT MANAGEMENT
// ============================================================================

export interface Document {
  id: string;
  userId: string;
  type: DocumentType;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  category: string;
  expiryDate?: string;
  issueDate?: string;
  issuingAuthority?: string;
  documentNumber?: string;
  status: DocumentStatus;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  metadata?: DocumentMetadata;
  // Additional properties for demo data
  uploadDate?: string;
  tags?: string[];
  [key: string]: any;
}

export interface DocumentMetadata {
  countryOfIssue?: string;
  placeOfIssue?: string;
  language?: string;
  translationRequired?: boolean;
  notarized?: boolean;
  apostilled?: boolean;
  digitalSignature?: boolean;
}

// ============================================================================
// TASK MANAGEMENT
// ============================================================================

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignmentId?: string;
  vesselId?: string;
  assignedTo: string;
  createdBy: string;
  tags: string[];
  attachments: string[];
  progress: number; // 0-100
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[]; // task IDs
  subtasks?: Subtask[];
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
  editedAt?: string;
}

export interface MobilizationChecklist {
  id: string;
  assignmentId: string;
  seafarerId: string;
  steps: MobilizationStep[];
  overallProgress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// ============================================================================
// TRAINING MANAGEMENT
// ============================================================================

export interface Course {
  id: string;
  title: string;
  description: string;
  provider: string;
  category: string;
  subcategory?: string;
  duration: number; // hours
  format: 'online' | 'classroom' | 'blended' | 'simulator';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  prerequisites: string[];
  learningObjectives: string[];
  curriculum: CourseModule[];
  certificateValidity: number; // months
  cost: number;
  currency: string;
  status: TrainingStatus;
  enrolledAt?: string;
  completedAt?: string;
  certificateUrl?: string;
  progress: number; // 0-100
  instructor?: Instructor;
  location?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: number; // hours
  order: number;
  completed: boolean;
  completedAt?: string;
}

export interface Instructor {
  id: string;
  name: string;
  qualifications: string[];
  experience: number; // years
  avatar?: string;
}

export interface Certification {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  certificateNumber: string;
  issuedDate: string;
  expiryDate?: string;
  status: 'valid' | 'expired' | 'revoked' | 'suspended';
  certificateUrl: string;
  verifiedAt?: string;
  verifiedBy?: string;
  issuingAuthority: string;
  renewalRequired: boolean;
  renewalDate?: string;
}

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: NotificationMetadata;
  expiresAt?: string;
  createdAt: string;
  readAt?: string;
  // Additional properties for demo data
  timestamp?: string;
  [key: string]: any;
}

export interface NotificationMetadata {
  assignmentId?: string;
  vesselId?: string;
  taskId?: string;
  documentId?: string;
  courseId?: string;
  entityType?: string;
  entityId?: string;
  customData?: Record<string, any>;
  // Additional properties for demo data
  vesselName?: string;
  position?: string;
  company?: string;
  documentType?: string;
  [key: string]: any;
}

// ============================================================================
// COMPANY MANAGEMENT
// ============================================================================

export interface Company {
  id: string;
  name: string;
  type: 'shipping' | 'crewing' | 'management' | 'other';
  registrationNumber: string;
  taxId?: string;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  description?: string;
  fleetSize?: number;
  establishedYear?: number;
  certifications: string[];
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// PORT AND LOCATION MANAGEMENT
// ============================================================================

export interface Port {
  id: string;
  name: string;
  code: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  facilities: PortFacility[];
  restrictions?: string[];
  fees?: PortFee[];
}

export interface PortFacility {
  type: 'fuel' | 'provisions' | 'repairs' | 'crew_change' | 'cargo' | 'passenger';
  available: boolean;
  description?: string;
}

export interface PortFee {
  type: string;
  amount: number;
  currency: string;
  description?: string;
}

// ============================================================================
// WEATHER AND SAFETY
// ============================================================================

export interface WeatherAlert {
  id: string;
  vesselId?: string;
  region: string;
  type: 'storm' | 'cyclone' | 'tsunami' | 'ice' | 'fog' | 'other';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  description: string;
  coordinates?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  validFrom: string;
  validTo: string;
  createdAt: string;
}

export interface SafetyIncident {
  id: string;
  vesselId: string;
  type: 'accident' | 'injury' | 'near_miss' | 'equipment_failure' | 'security' | 'other';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  location?: string;
  reportedBy: string;
  reportedAt: string;
  investigationStatus: 'pending' | 'in_progress' | 'completed';
  correctiveActions?: string[];
  lessonsLearned?: string[];
}

// ============================================================================
// API AND UTILITY TYPES
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  priority?: string;
  type?: string;
  vesselType?: VesselType;
  rank?: Rank;
  department?: Department;
  country?: string;
  port?: string;
}

export interface DashboardStats {
  pendingAssignments: number;
  activeContracts: number;
  documentsExpiringSoon: number;
  trainingDue: number;
  upcomingTasks: number;
  notificationsUnread: number;
  vesselsInFleet: number;
  activeSeafarers: number;
  totalCompanies: number;
  safetyIncidents: number;
}

export interface ActivityItem {
  id: string;
  type: 'assignment' | 'document' | 'task' | 'training' | 'system' | 'vessel' | 'safety';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
  actionUrl?: string;
  userId?: string;
  userName?: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  companyId?: string;
}

export interface ProfileUpdateForm {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  bankDetails?: BankDetails;
}

export interface AssignmentResponseForm {
  assignmentId: string;
  response: 'accept' | 'decline';
  message?: string;
  conditions?: string[];
}

export interface DocumentUploadForm {
  type: DocumentType;
  title: string;
  description?: string;
  expiryDate?: string;
  issueDate?: string;
  issuingAuthority?: string;
  documentNumber?: string;
}

// All types are already exported as interfaces above