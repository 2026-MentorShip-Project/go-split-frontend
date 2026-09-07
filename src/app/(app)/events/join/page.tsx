"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Chip from "@/components/ui/Chip";
import { BackIcon } from "@/components/icons";

export default function JoinFormPage() {
  const router = useRouter();
  const join = useStore((s) => s.join);
  const setJoin = useStore((s) => s.setJoin);
  const condTags = useStore((s) => s.condTags);
  const cur = useStore((s) => s.cur);
  const setCur = useStore((s) => s.setCur);
  const setFirstJoin = useStore((s) => s.setFirstJoin);

  const toggleCond = (c: string) => {
    const conds = join.conds.includes(c)
      ? join.conds.filter((x) => x !== c)
      : [...join.conds, c];
    setJoin({ conds });
  };

  const handleSubmit = () => {
    setCur(0);
    setFirstJoin(false);
    router.push(`/events/${cur}`);
  };

  return (
    <div className="page-shell page-shell--narrow">
      <div className="topbar">
        <div className="topbar-row">
          <IconButton onClick={() => router.push("/events/invite")}>
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
          />
        </div>

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

      <Button className="mt-24" onClick={handleSubmit}>加入</Button>
    </div>
  );
}
