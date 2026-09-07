"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import { BackIcon } from "@/components/icons";

export default function RegisterPage() {
  const router = useRouter();
  const acc = useStore((s) => s.acc);
  const setAcc = useStore((s) => s.setAcc);
  const setGuest = useStore((s) => s.setGuest);

  const handleRegister = () => {
    setGuest(false);
    router.push("/");
  };

  return (
    <div className="page-shell page-shell--narrow">
      <div className="topbar">
        <div className="topbar-row">
          <IconButton onClick={() => router.push("/login")}>
            <BackIcon />
          </IconButton>
          <span className="topbar-title">建立帳號</span>
        </div>
      </div>
      <div className="flex-col gap-16 mt-24">
        <div className="field">
          <div className="field-label">暱稱</div>
          <Input
            value={acc.name}
            onChange={(e) => setAcc({ name: e.target.value })}
            placeholder="你的顯示名稱"
          />
        </div>
        <div className="field">
          <div className="field-label">Email</div>
          <Input
            value={acc.mail}
            onChange={(e) => setAcc({ mail: e.target.value })}
            placeholder="you@example.com"
          />
        </div>
        <div className="field">
          <div className="field-label">密碼</div>
          <Input
            value={acc.pass}
            onChange={(e) => setAcc({ pass: e.target.value })}
            placeholder="至少 8 個字元"
          />
        </div>
      </div>
      <Button className="mt-24" onClick={handleRegister}>
        註冊並開始
      </Button>
    </div>
  );
}
