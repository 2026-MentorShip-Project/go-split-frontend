"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Chip from "@/components/ui/Chip";
import { BackIcon } from "@/components/icons";
import { joinByCode } from "@/api/auth";
import { joinEvent } from "@/api/event";

export default function JoinFormPage() {
  const router = useRouter();
  const join = useStore((s) => s.join);
  const setJoin = useStore((s) => s.setJoin);
  const condTags = useStore((s) => s.condTags);
  const setCur = useStore((s) => s.setCur);
  const code = useStore((s) => s.code);
  const join2 = useStore((s) => s.join2);
  const setGuest = useStore((s) => s.setGuest);

  const [loading, setLoading] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const nameErr = nameTouched && !join.name.trim();

  const toggleCond = (c: string) => {
    const conds = join.conds.includes(c)
      ? join.conds.filter((x) => x !== c)
      : [...join.conds, c];
    setJoin({ conds });
  };

  const handleSubmit = async () => {
    setNameTouched(true);
    if (!join.name.trim()) return;
    setLoading(true);
    try {
      // /auth/join always issues a guest session, replacing an account one.
      // Anyone already signed in joins through the session-authenticated route.
      const signedIn = Boolean(sessionStorage.getItem("userName"));
      const eventId = signedIn
        ? (await joinEvent({ code, name: join.name, cond_tags: join.conds, note: join.note })).event_id
        : await joinAsGuest();
      setCur(eventId);
      router.push(`/events/${eventId}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "加入活動失敗");
    } finally {
      setLoading(false);
    }
  };

  const joinAsGuest = async () => {
    const result = await joinByCode({
      code,
      email: join2.mail,
      name: join.name,
      phone: join2.phone,
      cond_tags: join.conds.length > 0 ? join.conds : undefined,
      note: join.note,
    });
    localStorage.setItem("guest_session", JSON.stringify(result));
    setGuest(true);
    return result.event_id;
  };

  return (
    <div className="page-shell page-shell--narrow">
      <div className="topbar">
        <div className="topbar-row">
          <IconButton onClick={() => router.back()}>
            <BackIcon />
          </IconButton>
          <span className="topbar-title">填寫加入訊息</span>
        </div>
      </div>

      <div className="flex-col gap-20 mt-20">
        <div className="field">
          <div className="field-label">參與者姓名</div>
          <Input
            value={join.name}
            onChange={(e) => setJoin({ name: e.target.value })}
            placeholder="你的名字"
            error={nameErr}
          />
          {nameErr && <div className="field-err">請填寫姓名</div>}
        </div>

        {condTags.length > 0 && (
          <div>
            <div className="fs14" style={{ marginBottom: 9 }}>人員條件</div>
            <div className="flex wrap gap-8">
              {condTags.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  kind="cond"
                  selected={join.conds.includes(c)}
                  md
                  hash
                  onClick={() => toggleCond(c)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="field">
          <div className="field-label">其他備註</div>
          <textarea
            className="input"
            rows={3}
            placeholder="例：會晚 20 分鐘到"
            value={join.note}
            onChange={(e) => setJoin({ note: e.target.value })}
          />
        </div>
      </div>

      <Button className="mt-24" onClick={handleSubmit} disabled={loading}>
        {loading ? "加入中…" : "加入"}
      </Button>
    </div>
  );
}
