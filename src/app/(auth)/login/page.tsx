"use client";

import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const code = useStore((s) => s.code);
  const setCode = useStore((s) => s.setCode);
  const setGuest = useStore((s) => s.setGuest);
  const setFirstJoin = useStore((s) => s.setFirstJoin);
  const role = useStore((s) => s.role);
  const setRole = useStore((s) => s.setRole);
  const persona = useStore((s) => s.persona);
  const setPersona = useStore((s) => s.setPersona);
  const setBlank = useStore((s) => s.setBlank);

  const [showInvite, setShowInvite] = useState(false);
  const [codeTouched, setCodeTouched] = useState(false);
  const codeErr = codeTouched && !code.trim();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const googleToken = credentialResponse.credential;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('accessToken', data.token.accessToken);
        router.push('/dashboard');
      } else {
        alert(`登入失敗: ${data.message}`);
      }
    } catch (error) {
      console.error('API 呼叫失敗', error);
    }
  };

  const handleJoinByCode = () => {
    setCodeTouched(true);
    if (!code.trim()) return;
    setGuest(true);
    setFirstJoin(true);
    router.push("/events/invite");
  };

  const handleReset = () => {
    setRole("host");
    setPersona("host");
    setGuest(false);
    setBlank(false);
    setFirstJoin(false);
    setCodeTouched(false);
  };

  return (
    <div
      className="page-shell page-shell--narrow"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 76 }}
    >
      <div
        style={{
          width: 70, height: 70, borderRadius: 20, background: "var(--teal)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 32, fontWeight: 700,
        }}
      >
        分
      </div>
      <div style={{ marginTop: 16, fontSize: 32, fontWeight: 700, letterSpacing: ".04em", color: "var(--text)" }}>
        分帳吧
      </div>
      <div style={{ marginTop: 8, fontSize: 14, color: "var(--text3)" }}>
        輕鬆分帳，活動費用一目了然
      </div>

      <div style={{ marginTop: 36, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.error('Google 登入視窗載入或操作失敗')}
            useOneTap
            width="100%"
            size="large"
            shape="rectangular"
            text="signin_with"
          />
        </GoogleOAuthProvider>
      </div>

      <div
        style={{
          marginTop: 32, width: "100%", display: "flex", alignItems: "center", gap: 12,
        }}
      >
        <div style={{ flex: 1, height: 1, background: "var(--ln-control)" }} />
        <span style={{ fontSize: 12, color: "var(--text3)", whiteSpace: "nowrap" }}>或</span>
        <div style={{ flex: 1, height: 1, background: "var(--ln-control)" }} />
      </div>

      {!showInvite ? (
        <Button variant="secondary" className="mt-20" onClick={() => setShowInvite(true)}>
          使用邀請碼加入活動
        </Button>
      ) : (
        <div className="flex-col gap-16 mt-20" style={{ width: "100%" }}>
          <div className="field">
            <div className="field-label">活動邀請碼</div>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="例：4KQ2-8P"
              error={codeErr}
              style={{
                font: "600 20px/1.2 ui-monospace,Menlo,monospace",
                letterSpacing: ".12em",
                textAlign: "center",
              }}
            />
            {codeErr && <div className="field-err">請填寫活動邀請碼</div>}
          </div>
          <Button onClick={handleJoinByCode}>進入活動</Button>
          <button
            className="btn-link btn-link--muted"
            style={{ alignSelf: "center", border: "none", background: "none", cursor: "pointer", fontSize: 12, color: "var(--text3)" }}
            onClick={() => { setShowInvite(false); setCodeTouched(false); }}
          >
            取消
          </button>
        </div>
      )}

      <div className="hint mt-10" style={{ width: "100%" }}>
        使用 Google 帳號即可快速登入；如有活動邀請碼，可直接加入活動。
      </div>
    </div>
  );
}
