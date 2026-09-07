"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import SegmentedTabs from "@/components/ui/SegmentedTabs";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const loginTab = useStore((s) => s.loginTab);
  const setLoginTab = useStore((s) => s.setLoginTab);
  const acc = useStore((s) => s.acc);
  const setAcc = useStore((s) => s.setAcc);
  const join2 = useStore((s) => s.join2);
  const setJoin2 = useStore((s) => s.setJoin2);
  const code = useStore((s) => s.code);
  const setCode = useStore((s) => s.setCode);
  const loginTouched = useStore((s) => s.loginTouched);
  const setLoginTouched = useStore((s) => s.setLoginTouched);
  const role = useStore((s) => s.role);
  const setRole = useStore((s) => s.setRole);
  const persona = useStore((s) => s.persona);
  const setPersona = useStore((s) => s.setPersona);
  const setGuest = useStore((s) => s.setGuest);
  const setFirstJoin = useStore((s) => s.setFirstJoin);
  const setBlank = useStore((s) => s.setBlank);
  const joinTouched = useStore((s) => s.joinTouched);
  const setJoinTouched = useStore((s) => s.setJoinTouched);

  const onAcc = loginTab === "acc";
  const accMailErr = loginTouched && !acc.mail.trim();
  const accPassErr = loginTouched && !acc.pass.trim();
  const joinMailErr = joinTouched && !join2.mail.trim();
  const joinPhoneErr = joinTouched && !join2.phone.trim();
  const joinCodeErr = joinTouched && !code.trim();

  const handleLoginAsAccount = () => {
    setLoginTouched(true);
    if (!acc.mail.trim() || !acc.pass.trim()) return;
    setGuest(false);
    router.push("/");
  };

  const handleJoinByCode = () => {
    setJoinTouched(true);
    if (!join2.mail.trim() || !join2.phone.trim() || !code.trim()) return;
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
    setLoginTouched(false);
    setJoinTouched(false);
  };

  const roleRows: { role: string; opts: { label: string; sel: boolean; pick: () => void }[] }[] = [
    {
      role: "角色",
      opts: [
        { label: "主辦者", sel: role === "host", pick: () => setRole("host") },
        { label: "協辦者", sel: role === "co", pick: () => setRole("co") },
        { label: "參與者", sel: role === "member", pick: () => setRole("member") },
      ],
    },
    {
      role: "視角",
      opts: [
        { label: "主辦者", sel: persona === "host", pick: () => setPersona("host") },
        { label: "協辦者", sel: persona === "co", pick: () => setPersona("co") },
        { label: "參與者", sel: persona === "member", pick: () => setPersona("member") },
      ],
    },
  ];

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

      <div style={{ marginTop: 28, width: "100%" }}>
        <SegmentedTabs
          tabs={[
            { label: "帳號登入", active: onAcc, onClick: () => { setLoginTab("acc"); setLoginTouched(false); } },
            { label: "邀請碼加入", active: !onAcc, onClick: () => { setLoginTab("code"); setJoinTouched(false); } },
          ]}
        />
      </div>

      {onAcc ? (
        <>
          <div className="flex-col gap-16 mt-20" style={{ width: "100%" }}>
            <div className="field">
              <div className="field-label">Email</div>
              <Input
                value={acc.mail}
                onChange={(e) => setAcc({ mail: e.target.value })}
                placeholder="you@example.com"
                error={accMailErr}
              />
              {accMailErr && <div className="field-err">請填寫 Email</div>}
            </div>
            <div className="field">
              <div className="field-label">密碼</div>
              <Input
                value={acc.pass}
                onChange={(e) => setAcc({ pass: e.target.value })}
                placeholder="輸入密碼"
                error={accPassErr}
              />
              {accPassErr && <div className="field-err">請填寫密碼</div>}
            </div>
          </div>
          <Button className="mt-20" onClick={handleLoginAsAccount}>登入</Button>
          <div className="flex-col gap-12 mt-12" style={{ width: "100%" }}>
            <Button variant="secondary" onClick={() => router.push("/register")}>我要註冊</Button>
          </div>
        </>
      ) : (
        <>
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
                error={joinCodeErr}
                style={{
                  font: "600 20px/1.2 ui-monospace,Menlo,monospace",
                  letterSpacing: ".12em",
                  textAlign: "center",
                }}
              />
              {joinCodeErr && <div className="field-err">請填寫活動邀請碼</div>}
            </div>
          </div>
          <Button className="mt-20" onClick={handleJoinByCode}>進入活動</Button>
        </>
      )}

      <div className="roleswitch" style={{ marginTop: 28, width: "100%", boxSizing: "border-box" }}>
        <div className="roleswitch-head">
          <span className="roleswitch-title">原型檢視身份</span>
          <button className="pill-dashed" onClick={handleReset}>重新開始</button>
        </div>
        <div className="roleswitch-rows" style={{ marginTop: 12 }}>
          {roleRows.map((row) => (
            <div className="roleswitch-row" key={row.role}>
              <span className="roleswitch-label">{row.role}</span>
              <span className="roleswitch-opts">
                {row.opts.map((o) => (
                  <button
                    key={o.label}
                    className={`pill-toggle${o.sel ? " is-sel" : ""}`}
                    onClick={o.pick}
                  >
                    {o.label}
                  </button>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="hint mt-10" style={{ width: "100%" }}>
        免帳號加入。已被加入過的信箱／手機會直接進入活動頁；初次加入則顯示活動邀請。
        <br />
        已加入範例：mei@example.com 或 0912345678
      </div>
    </div>
  );
}
