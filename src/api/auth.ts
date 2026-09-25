import { BASE_URL, apiPost, apiFetch } from "./constant";

export interface GoogleAuthResponse {
  id: number;
  email: string;
  name: string;
}

export async function googleLogin(idToken: string): Promise<GoogleAuthResponse> {
  const res = await apiPost(`${BASE_URL}/auth/google`, { id_token: idToken });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "登入失敗");
  }

  return res.json();
}

export interface JoinByCodeRequest {
  code: string;
  email: string;
  name?: string;
  phone: string;
}

export interface JoinByCodeResponse {
  event_id: number;
  guest_id: number;
  role: string;
}

export async function logout(): Promise<void> {
  await apiFetch(`${BASE_URL}/auth/logout`, { method: "POST" });
  sessionStorage.removeItem('userName');
  localStorage.removeItem('guest_session');
}

export async function joinByCode(req: JoinByCodeRequest): Promise<JoinByCodeResponse> {
  const res = await apiPost(`${BASE_URL}/auth/join`, req);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 404) throw new Error("找不到此邀請碼，請確認後再試");
    if (res.status === 410) throw new Error("此活動已結算，無法再加入");
    throw new Error(data.error ?? "加入活動失敗");
  }

  return res.json();
}
