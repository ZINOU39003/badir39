import { AuthUser, Complaint, Message } from "@/types";

const API_BASE = "/api";

function generateId() {
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `RPT-${n}`;
}

// --- Auth ---

export type AuthResponse = {
  access_token: string;
  user: AuthUser;
};

export async function loginRequest(phone: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "خطأ في بيانات الدخول");
  return data as AuthResponse;
}

export async function registerRequest(payload: {
  phone: string;
  password: string;
  full_name: string;
  username?: string;
  email?: string;
  role?: string;
  organization?: string;
  logo_uri?: string;
  cover_uri?: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "فشل عملية الإنشاء");
  return data as AuthResponse;
}

// --- Complaints ---

export async function getMyComplaints(userId: string): Promise<Complaint[]> {
  try {
    const res = await fetch(`${API_BASE}/complaints?reporter_id=${userId}`);
    if (!res.ok) throw new Error("API error");
    const json = await res.json();
    return (json?.data?.items ?? []) as Complaint[];
  } catch {
    return [];
  }
}

export async function getAdminComplaints(): Promise<Complaint[]> {
  try {
    const res = await fetch(`${API_BASE}/complaints`);
    if (!res.ok) throw new Error("API error");
    const json = await res.json();
    return (json?.data?.items ?? []) as Complaint[];
  } catch {
    return [];
  }
}

export async function createComplaint(payload: {
  title: string;
  description: string;
  category: string;
  location_text: string;
  lat: number;
  lng: number;
  reporter_id?: string;
  assigned_dept: string;
  media_urls?: string[];
}): Promise<Complaint> {
  const id = generateId();
  const body = {
    id,
    title: payload.title,
    description: payload.description,
    location_text: payload.location_text,
    lat: payload.lat,
    lng: payload.lng,
    category: payload.category,
    reporter_id: payload.reporter_id,
    assigned_dept: payload.assigned_dept,
    media_urls: payload.media_urls || [],
  };

  try {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("failed");
  } catch {
    // fallback - still return the created complaint locally
  }

  return {
    ...body,
    location: payload.location_text,
    status: "submitted",
    created_at: new Date().toISOString(),
    messages: [],
    history: [],
  } as Complaint;
}

export async function getComplaintMessages(complaintId: string): Promise<Message[]> {
  try {
    const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(complaintId)}/messages`);
    if (!res.ok) throw new Error("failed");
    const json = await res.json();
    return (json?.data?.items ?? []) as Message[];
  } catch {
    return [];
  }
}

export async function sendMessage(complaintId: string, text: string, user: AuthUser): Promise<void> {
  try {
    await fetch(`${API_BASE}/complaints/${encodeURIComponent(complaintId)}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: user.id,
        sender_name: user.full_name,
        sender_role: user.role,
        text,
      }),
    });
  } catch (err) {
    console.error(err);
  }
}

// --- Departments ---

export async function getDepartments(token?: string | null): Promise<any[]> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/admin/departments`, { headers });
    if (!res.ok) throw new Error("API error");
    const json = await res.json();
    return (json?.data?.items ?? []) as any[];
  } catch {
    return [];
  }
}

export async function createDepartment(payload: any, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/departments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(`خطأ (${res.status}): ${json.message || "Unknown error"}`);
  }
}

export async function deleteDepartment(id: string, token: string): Promise<void> {
  await fetch(`${API_BASE}/admin/departments/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
