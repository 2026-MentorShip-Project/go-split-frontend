const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface GoogleAuthResponse {
  token: {
    accessToken: string;
  };
  message?: string;
}

export async function googleLogin(googleToken: string): Promise<GoogleAuthResponse> {
  const res = await fetch(`${BASE_URL}/v1/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: googleToken }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "登入失敗");
  }

  return data;
}
