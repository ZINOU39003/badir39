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

export type Complaint = {
  id: string;
  reporter_id?: string;
  lat?: number;
  lng?: number;
  reporter_name?: string;
  reporter_phone?: string;
  reporter_email?: string;
  title: string;
  description: string;
  category: string;
  location: string;
  assigned_dept: string;
  status: ComplaintStatus;
  created_at: string;
  media_urls?: string[];
  history: TimelineStep[];
  messages: Message[];
};

export type ServiceDept = {
  id: string;
  name: string;
  sector: string;
  logo?: string;
};
