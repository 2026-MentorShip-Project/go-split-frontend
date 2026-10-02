"use client";

import { useRouter } from "next/navigation";
import type { EventDetail } from "@/api/event";
import type { InvalidSplitLine } from "@/api/settlement";
import { splitIssueText } from "@/lib/split-validity";

interface InvalidSplitsNoticeProps {
  event: EventDetail;
  lines: InvalidSplitLine[];
}

export default function InvalidSplitsNotice({ event, lines }: InvalidSplitsNoticeProps) {
  const router = useRouter();
  const lineName = (line: InvalidSplitLine) =>
    event.items.find((it) => it.id === line.item_id)?.details.find((d) => d.id === line.detail_id)?.name || "（未命名）";

  return (
    <div className="card card-pad mt-20">
      <div className="fs16 fw700">有 {lines.length} 筆細項需要調整</div>
      <div className="fs13 text2 mt-10">調整後才能查看付款流向並結清活動。</div>
      <div className="flex-col gap-10 mt-14">
        {lines.map((line) => (
          <button
            key={`${line.item_id}-${line.detail_id}`}
            type="button"
            className="flex between items-center gap-10"
            style={{ border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left" }}
            onClick={() => router.push(`/events/${event.id}/items/${line.item_id}`)}
          >
            <span className="fs14">{lineName(line)}</span>
            <span className="fs12" style={{ color: "var(--danger)" }}>{splitIssueText(line.code)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
