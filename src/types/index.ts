export type UserRole = "citizen" | "department" | "admin";

export type AuthUser = {
  id: string;
  phone: string;
  full_name: string;
  username?: string;
  email?: string;
  role: UserRole;
  organization?: string;
  coverUri?: string;
  logoUri?: string;
};

export type ComplaintStatus =
  | "submitted"
  | "under_review"
  | "in_progress"
  | "resolved"
  | "rejected";

export type Message = {
  id: string;
  text: string;
  sender_role: UserRole | "officer";
  sender_name: string;
  created_at: string;
  image_url?: string;
};

export type TimelineStep = {
  id: string;
  status: ComplaintStatus;
  at: string;
  note: string;
  actor: string;
};

export interface Complaint {
  id: string;
  title: string;
  description: string;
  location_text: string;
  lat?: number;
  lng?: number;
  district?: string;
  municipality?: string;
  category: string;
  status: ComplaintStatus;
  reporter_id: number;
  assigned_dept?: string;
  media_urls?: string[];
  created_at: string;
  messages: Message[];
  history?: TimelineStep[];
};

export type ServiceDept = {
  id: string;
  name: string;
  sector: string;
  logo?: string;
};
