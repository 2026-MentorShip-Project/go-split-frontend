const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface GoogleAuthResponse {
  id: number;
  email: string;
  name: string;
}

export async function googleLogin(idToken: string): Promise<GoogleAuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 重要：允許接收 session cookie
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "登入失敗");
  }

  return res.json();
}
