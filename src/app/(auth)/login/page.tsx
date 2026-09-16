"use client";

import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import { googleLogin, joinByCode } from "@/api/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const code = useStore((s) => s.code);
  const setCode = useStore((s) => s.setCode);
  const join2 = useStore((s) => s.join2);
  const setJoin2 = useStore((s) => s.setJoin2);
  const setGuest = useStore((s) => s.setGuest);
  const setFirstJoin = useStore((s) => s.setFirstJoin);
  const setUserName = useStore((s) => s.setUserName);

  const [showInvite, setShowInvite] = useState(false);
  const [joinTouched, setJoinTouched] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const joinMailErr = joinTouched && !join2.mail.trim();
  const joinPhoneErr = joinTouched && !join2.phone.trim();
  const codeErr = joinTouched && !code.trim();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      console.error('No credential received from Google');
      return;
    }
    
    try {
      const user = await googleLogin(idToken);
      setUserName(user.name);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login API error:', error);
      alert(error instanceof Error ? error.message : "登入失敗");
    }
  };

  const handleJoinByCode = async () => {
    setJoinTouched(true);
    if (!join2.mail.trim() || !join2.phone.trim() || !code.trim()) return;
    setJoinLoading(true);
    try {
      const result = await joinByCode({ code, email: join2.mail, phone: join2.phone });
      localStorage.setItem('guest_session', JSON.stringify(result));
      setGuest(true);
      setFirstJoin(true);
      router.push("/events/invite");
    } catch (error) {
      alert(error instanceof Error ? error.message : "加入活動失敗");
    } finally {
      setJoinLoading(false);
    }
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
            width="100%"
            size="large"
            shape="square"
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
            <div className="field-label">Email</div>
            <Input
              value={join2.mail}
              onChange={(e) => setJoin2({ mail: e.target.value })}
              placeholder="you@example.com"
              error={joinMailErr}
            />
            {joinMailErr && <div className="field-err">請填寫 Email</div>}
          </div>
          <div className="field">
            <div className="field-label">手機</div>
            <Input
              value={join2.phone}
              onChange={(e) => setJoin2({ phone: e.target.value })}
              placeholder="09xx-xxx-xxx"
              error={joinPhoneErr}
              inputMode="tel"
            />
            {joinPhoneErr && <div className="field-err">請填寫手機號碼</div>}
          </div>
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
          <Button onClick={handleJoinByCode} disabled={joinLoading}>
            {joinLoading ? "加入中…" : "進入活動"}
          </Button>
          <button
            className="btn-link btn-link--muted"
            style={{ alignSelf: "center", border: "none", background: "none", cursor: "pointer", fontSize: 12, color: "var(--text3)" }}
            onClick={() => { setShowInvite(false); setJoinTouched(false); }}
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
