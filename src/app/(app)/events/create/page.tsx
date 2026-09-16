"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import Input from "@/components/ui/Input";
import IconButton from "@/components/ui/IconButton";
import { BackIcon, CheckIcon } from "@/components/icons";
import DatePicker from "@/components/ui/DatePicker";
import { TEMPLATE_OPTS } from "@/data/seed";
import { createEvent, toRfc3339 } from "@/api/event";

export default function CreateEventPage() {
  const router = useRouter();
  const ev = useStore((s) => s.ev);
  const setEv = useStore((s) => s.setEv);
  const evNameTouched = useStore((s) => s.evNameTouched);
  const setEvNameTouched = useStore((s) => s.setEvNameTouched);
  const setCur = useStore((s) => s.setCur);
  const setCode = useStore((s) => s.setCode);
  const events = useStore((s) => s.events);
  const setEvents = useStore((s) => s.setEvents);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const evNameErr = evNameTouched && !ev.name.trim();

  const handleCreate = async () => {
    setEvNameTouched(true);
    setSubmitError("");
    if (!ev.name.trim() || submitting) return;

    setSubmitting(true);
    try {
      const startsAt = toRfc3339(ev.d1, ev.t1);
      const endsAt = toRfc3339(ev.d2, ev.t2);
      const created = await createEvent({
        name: ev.name.trim(),
        template: ev.template,
        ...(ev.place.trim() ? { place: ev.place.trim() } : {}),
        ...(startsAt ? { starts_at: startsAt } : {}),
        ...(endsAt ? { ends_at: endsAt } : {}),
      });

      const newEvent = {
        name: created.name,
        date: ev.d1 || "",
        place: created.place ?? ev.place,
        role: "host" as const,
        archived: false,
        template: created.template,
      };
      const newEvents = [...events, newEvent];
      setEvents(newEvents);
      setCur(newEvents.length - 1);
      setCode(created.invite_code);
      setEv({ name: "", date: "", place: "", template: "自訂", d1: "", t1: "", d2: "", t2: "" });
      setEvNameTouched(false);
      router.push(`/events/${newEvents.length - 1}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "建立活動失敗");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="topbar">
        <div className="topbar-row">
          <IconButton onClick={() => router.push("/dashboard")}>
            <BackIcon />
          </IconButton>
          <span className="topbar-title">新增活動</span>
          <IconButton
            variant="soft"
            title="建立活動"
            onClick={() => void handleCreate()}
            disabled={submitting}
            style={{ marginLeft: "auto" }}
          >
            <CheckIcon size={18} />
          </IconButton>
        </div>
      </div>

      <div className="flex-col gap-20 mt-10">
        <div>
          <div className="field-label">
            活動名稱 <span style={{ color: "var(--danger)" }}>＊</span>
          </div>
          <Input
            value={ev.name}
            onChange={(e) => setEv({ name: e.target.value })}
            placeholder="例：部門季末聚餐"
            error={evNameErr}
            small
          />
          {evNameErr && <div className="field-err">請輸入活動名稱</div>}
          {submitError && <div className="field-err">{submitError}</div>}
        </div>

        <div>
          <div className="field-label">活動時間</div>
          <div className="flex wrap items-center gap-10">
            <div style={{ flex: "1 1 280px", minWidth: 0 }}>
              <DatePicker
                dateValue={ev.d1}
                combinedValue={ev.d1 && ev.t1 ? `${ev.d1}T${ev.t1}` : ""}
                onDateChange={(e) => setEv({ d1: e.target.value })}
                onCombinedChange={(e) => {
                  const [d, t] = e.target.value.split("T");
                  setEv({ d1: d, t1: t || "" });
                }}
                onClearDate={() => setEv({ d1: "", t1: "" })}
              />
            </div>
            <span className="text3 fs14">～</span>
            <div style={{ flex: "1 1 280px", minWidth: 0 }}>
              <DatePicker
                dateValue={ev.d2}
                combinedValue={ev.d2 && ev.t2 ? `${ev.d2}T${ev.t2}` : ""}
                onDateChange={(e) => setEv({ d2: e.target.value })}
                onCombinedChange={(e) => {
                  const [d, t] = e.target.value.split("T");
                  setEv({ d2: d, t2: t || "" });
                }}
                onClearDate={() => setEv({ d2: "", t2: "" })}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="field-label">活動地點</div>
          <Input
            value={ev.place}
            onChange={(e) => setEv({ place: e.target.value })}
            placeholder="例：大安區 好客燒肉"
            small
          />
        </div>

        <div>
          <div className="field-label" style={{ marginBottom: 9 }}>分攤方式（情境模板）</div>
          <div className="grid-cards">
            {TEMPLATE_OPTS.map((t) => (
              <button
                key={t.label}
                className="card card-pad"
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  ...(ev.template === t.label
                    ? { borderColor: "var(--teal)", borderWidth: 2, background: "rgba(111,183,183,.10)" }
                    : {}),
                }}
                onClick={() => setEv({ template: t.label })}
              >
                <span className="flex-col gap-4">
                  <span className="flex items-center gap-6 wrap">
                    <span className="fs14 fw500">{t.label}</span>
                    {t.soon && <span className="pill-soon">未規劃</span>}
                  </span>
                  <span className="fs12 text3">{t.hint}</span>
                </span>
                {ev.template === t.label ? (
                  <span className="dot-sel">✓</span>
                ) : (
                  <span className="dot-unsel" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
