// WaveSync Type Definitions - Maritime Crew Management

// ---------- Common Primitive Types ----------
export type Id = string;
export type ISODateString = string; // e.g., 2025-09-10T12:00:00Z
export type EmailString = string;
export type UrlString = string;

// ---------- Enums ----------
export enum UserRole {
  Seafarer = "Seafarer",
  CompanyUser = "CompanyUser",
  Admin = "Admin",
}

export enum UserStatus {
  Invited = "Invited",
  Active = "Active",
  Suspended = "Suspended",
  Deactivated = "Deactivated",
}

export enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other",
  PreferNotToSay = "PreferNotToSay",
}

export enum Rank {
  Master = "Master",
  ChiefOfficer = "ChiefOfficer",
  SecondOfficer = "SecondOfficer",
  ThirdOfficer = "ThirdOfficer",
  ChiefEngineer = "ChiefEngineer",
  SecondEngineer = "SecondEngineer",
  ThirdEngineer = "ThirdEngineer",
  ETO = "ETO",
  Bosun = "Bosun",
  AB = "AB",
  OS = "OS",
  Oiler = "Oiler",
  Wiper = "Wiper",
  Cook = "Cook",
  Steward = "Steward",
  Fitters = "Fitters",
  Pumpman = "Pumpman",
}

export enum AssignmentStatus {
  Draft = "Draft",
  Proposed = "Proposed",
  Accepted = "Accepted",
  Rejected = "Rejected",
  Confirmed = "Confirmed",
  Onboarded = "Onboarded",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export enum DocumentType {
  Passport = "Passport",
  SeamanBook = "SeamanBook", // CDC
  COC = "COC", // Certificate of Competency
  COP = "COP", // Certificate of Proficiency
  Medical = "Medical",
  YellowFever = "YellowFever",
  Visa = "Visa",
  Contract = "Contract",
  TrainingCertificate = "TrainingCertificate",
  Other = "Other",
}

export enum ExpiryStatus {
  Valid = "Valid",
  ExpiringSoon = "ExpiringSoon",
  Expired = "Expired",
  Missing = "Missing",
}

export enum TaskStatus {
  Open = "Open",
  InProgress = "InProgress",
  Blocked = "Blocked",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export enum TaskPriority {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Urgent = "Urgent",
}

export enum TaskType {
  DocumentSubmission = "DocumentSubmission",
  Medical = "Medical",
  Visa = "Visa",
  Travel = "Travel",
  Induction = "Induction",
  Training = "Training",
  Security = "Security",
  Other = "Other",
}

export enum ChecklistStatus {
  Pending = "Pending",
  Completed = "Completed",
  Waived = "Waived",
}

export enum VesselType {
  Container = "Container",
  BulkCarrier = "BulkCarrier",
  Tanker = "Tanker",
  LNG = "LNG",
  LPG = "LPG",
  Offshore = "Offshore",
  Passenger = "Passenger",
  GeneralCargo = "GeneralCargo",
  Tug = "Tug",
  RoRo = "RoRo",
  Research = "Research",
}

export enum TrainingStatus {
  Required = "Required",
  Assigned = "Assigned",
  InProgress = "InProgress",
  Completed = "Completed",
  Expired = "Expired",
}

export enum NotificationType {
  Assignment = "Assignment",
  Task = "Task",
  Document = "Document",
  Training = "Training",
  System = "System",
}

export enum NotificationSeverity {
  Info = "Info",
  Success = "Success",
  Warning = "Warning",
  Error = "Error",
}

export enum Permission {
  // General
  ViewDashboard = "ViewDashboard",
  ManageUsers = "ManageUsers",
  ManageVessels = "ManageVessels",
  ManageAssignments = "ManageAssignments",
  ManageDocuments = "ManageDocuments",
  ManageTraining = "ManageTraining",
  ManageTasks = "ManageTasks",
  ManageNotifications = "ManageNotifications",
  ManageSettings = "ManageSettings",
}

// ---------- Common Structures ----------
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  stateOrProvince?: string;
  postalCode?: string;
  countryCode: string; // ISO 3166-1 alpha-2
}

export interface ContactInfo {
  email: EmailString;
  phone?: string;
  address?: Address;
}

export interface FileAttachment {
  id: Id;
  fileName: string;
  url: UrlString;
  uploadedAt: ISODateString;
  sizeBytes?: number;
  mimeType?: string;
}

// ---------- Users ----------
export interface BaseUser {
  id: Id;
  role: UserRole;
  status: UserStatus;
  fullName: string;
  avatarUrl?: UrlString;
  contact: ContactInfo;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface NextOfKin {
  name: string;
  relationship: string;
  contact: ContactInfo;
}

export interface SeaServiceRecord {
  id: Id;
  vesselId?: Id;
  vesselName?: string;
  vesselType?: VesselType;
  rank: Rank;
  startDate: ISODateString;
  endDate?: ISODateString;
  remarks?: string;
}

export interface Seafarer extends BaseUser {
  role: UserRole.Seafarer;
  dateOfBirth?: ISODateString;
  placeOfBirth?: string;
  nationalityCode?: string; // ISO 3166-1 alpha-2
  gender?: Gender;
  rank?: Rank;
  nextOfKin?: NextOfKin;
  documents?: Certificate[];
  seaService?: SeaServiceRecord[];
  training?: Certification[];
}

export interface CompanyUser extends BaseUser {
  role: UserRole.CompanyUser;
  companyId: Id;
  department?: string;
  jobTitle?: string;
  permissions: Permission[];
}

export interface Admin extends BaseUser {
  role: UserRole.Admin;
  superAdmin: boolean;
  permissions: Permission[];
}

export type AnyUser = Seafarer | CompanyUser | Admin;

// ---------- Documents & Certificates ----------
export interface Certificate {
  id: Id;
  seafarerId: Id;
  type: DocumentType;
  name: string;
  number?: string;
  issueDate?: ISODateString;
  expiryDate?: ISODateString;
  issuingAuthority?: string;
  countryCode?: string; // For visas, passports, etc.
  files?: FileAttachment[];
  notes?: string;
}

export interface DocumentSummary {
  type: DocumentType;
  expiryStatus: ExpiryStatus;
  earliestExpiry?: ISODateString;
  missingCount?: number;
}

// ---------- Tasks & Checklists ----------
export interface Task {
  id: Id;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  dueDate?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdByUserId: Id;
  assigneeUserId?: Id;
  relatedAssignmentId?: Id;
  relatedSeafarerId?: Id;
  attachments?: FileAttachment[];
}

export interface ChecklistItem {
  key: string; // unique per checklist template
  label: string;
  required: boolean;
  status: ChecklistStatus;
  completedAt?: ISODateString;
  relatedTaskId?: Id;
  notes?: string;
}

export interface MobilizationChecklist {
  id: Id;
  assignmentId: Id;
  items: ChecklistItem[];
  lastReviewedAt?: ISODateString;
}

// ---------- Assignments ----------
export interface TravelSegment {
  from: string; // IATA or city/port name
  to: string;
  departure: ISODateString;
  arrival?: ISODateString;
  carrier?: string;
  bookingRef?: string;
}

export interface Assignment {
  id: Id;
  seafarerId: Id;
  vesselId: Id;
  rank: Rank;
  status: AssignmentStatus;
  proposedStartDate?: ISODateString;
  proposedEndDate?: ISODateString;
  confirmedStartDate?: ISODateString;
  confirmedEndDate?: ISODateString;
  contractMonths?: number;
  joiningPort?: string;
  remarks?: string;
  checklist?: MobilizationChecklist;
  tasks?: Task[];
  travelPlan?: TravelSegment[];
  medicalDue?: boolean;
  visaRequired?: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface AssignmentResponse {
  id: Id;
  assignmentId: Id;
  seafarerId: Id;
  status: Extract<AssignmentStatus, AssignmentStatus.Accepted | AssignmentStatus.Rejected> | AssignmentStatus.Accepted | AssignmentStatus.Rejected;
  respondedAt: ISODateString;
  message?: string;
}

// ---------- Vessels ----------
export interface Vessel {
  id: Id;
  imoNumber?: string; // 7-digit IMO number
  name: string;
  type: VesselType;
  flag?: string; // ISO country code
  companyId?: Id; // owning company
  managerId?: Id; // technical/crew manager company ID
  builtYear?: number;
  grt?: number; // Gross registered tonnage
  dwt?: number; // Deadweight tonnage
  callsign?: string;
  mmsi?: string;
}

// ---------- Training ----------
export interface Course {
  id: Id;
  code?: string;
  title: string;
  description?: string;
  mandatoryForRanks?: Rank[];
  validityMonths?: number; // Typical certificate validity period
}

export interface Certification {
  id: Id;
  seafarerId: Id;
  courseId: Id;
  certificateNumber?: string;
  status: TrainingStatus;
  issueDate?: ISODateString;
  expiryDate?: ISODateString;
  issuingAuthority?: string;
  attachment?: FileAttachment;
}

// ---------- Notifications ----------
export interface Notification {
  id: Id;
  userId: Id;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  actionUrl?: UrlString;
  createdAt: ISODateString;
  readAt?: ISODateString;
  meta?: Record<string, unknown>;
}

// ---------- Aggregates & API Shapes ----------
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AssignmentWithDetails extends Assignment {
  seafarer?: Seafarer;
  vessel?: Vessel;
}

export interface SeafarerProfile extends Seafarer {
  documentSummary?: DocumentSummary[];
  openTasks?: Task[];
  activeAssignments?: Assignment[];
}

// Utility type to ensure exhaustive checks on enums in switch/case
export type Never = never;

