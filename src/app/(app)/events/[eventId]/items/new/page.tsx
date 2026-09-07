"use client";

import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/store";
import Input from "@/components/ui/Input";
import IconButton from "@/components/ui/IconButton";
import Chip from "@/components/ui/Chip";
import { BackIcon, CheckIcon, PlusIcon, EditIcon, TrashIcon, XIcon, StarIcon, ChevDownIcon } from "@/components/icons";
import { money, num } from "@/lib/formatters";

export default function AddItemPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);

  const draft = useStore((s) => s.draft);
  const patchDraft = useStore((s) => s.patchDraft);
  const draftEdit = useStore((s) => s.draftEdit);
  const setDraftEdit = useStore((s) => s.setDraftEdit);
  const itemsBy = useStore((s) => s.itemsBy);
  const updateItemsForEvent = useStore((s) => s.updateItemsForEvent);
  const members = useStore((s) => s.members);
  const itemTags = useStore((s) => s.itemTags);
  const tagPick = useStore((s) => s.tagPick);
  const setTagPick = useStore((s) => s.setTagPick);
  const acc = useStore((s) => s.acc);

  const draftTotal = draft.details.reduce(
    (a, d) => a + (typeof d.amount === "number" ? d.amount : num(String(d.amount))),
    0,
  );

  const handleAddDetail = () => {
    const details = [...draft.details, { name: "", amount: "" as string | number, tags: [], note: "", ids: null }];
    patchDraft({ details });
    setDraftEdit(details.length - 1);
  };

  const handleSubmit = () => {
    if (draft.details.length === 0) return;
    const newItem = {
      id: "d" + Date.now(),
      by: acc.name,
      receipt: draft.receipt,
      details: draft.details.map((d) => ({
        ...d,
        amount: typeof d.amount === "number" ? d.amount : num(String(d.amount)),
      })),
    };
    const existing = itemsBy[eventId] || [];
    updateItemsForEvent(eventId, [...existing, newItem]);
    patchDraft({ receipt: false, details: [] });
    router.push(`/events/${eventId}`);
  };

  return (
    <div className="page-shell">
      <div className="topbar">
        <div className="topbar-row">
          <IconButton onClick={() => router.push(`/events/${eventId}`)}>
            <BackIcon />
          </IconButton>
          <span className="topbar-title">新增款項</span>
          <IconButton
            variant="soft"
            title="儲存款項"
            onClick={handleSubmit}
            style={{ marginLeft: "auto" }}
          >
            <CheckIcon size={18} />
          </IconButton>
        </div>
      </div>

      <div
        className="mt-20"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
          gap: 20, alignItems: "start",
        }}
      >
        <div>
          <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 20px" }}>
            <span className="fs18 fw500" style={{ flex: "none" }}>本筆款項合計</span>
            <span className="grow fs18 fw700" style={{ textAlign: "right" }}>{money(draftTotal)}</span>
          </div>
          <button className="receipt-drop" onClick={() => patchDraft({ receipt: !draft.receipt })}>
            {draft.receipt ? "已上傳收據" : "上傳收據（點擊模擬）"}
          </button>
        </div>

        <div>
          <div className="flex items-center between gap-10">
            <span className="section-title">明細</span>
            <IconButton variant="sm" title="新增明細" onClick={handleAddDetail}>
              <PlusIcon size={16} />
            </IconButton>
          </div>

          <div className="flex-col gap-16 mt-10">
            {draft.details.map((d, i) => {
              const isEditing = draftEdit === i;
              const amountVal = String(d.amount);
              return (
                <div key={i} className="card card-pad">
                  {!isEditing ? (
                    <div className="flex between items-center gap-10">
                      <span className="grow fs16 fw700" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {d.name || "（未命名）"}
                      </span>
                      <span className="flex items-center gap-10" style={{ flex: "1 1 auto", minWidth: 0, justifyContent: "flex-end" }}>
                        <span className="fs16 fw700" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {money(typeof d.amount === "number" ? d.amount : num(amountVal))}
                        </span>
                        <IconButton variant="sm" title="刪除" onClick={() => {
                          const details = draft.details.filter((_, j) => j !== i);
                          patchDraft({ details });
                        }}>
                          <TrashIcon size={14} />
                        </IconButton>
                        <IconButton variant="sm-fill" title="編輯" onClick={() => setDraftEdit(i)}>
                          <EditIcon size={14} />
                        </IconButton>
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex between items-center gap-10">
                        <Input
                          value={d.name}
                          onChange={(e) => {
                            const details = [...draft.details];
                            details[i] = { ...details[i], name: e.target.value };
                            patchDraft({ details });
                          }}
                          placeholder="品項名稱"
                          style={{ flex: 1, minWidth: 0, padding: 12, fontSize: 14 }}
                        />
                        <span className="flex items-center gap-8" style={{ flex: "none" }}>
                          <IconButton variant="sm-fill" title="完成" onClick={() => setDraftEdit(null)}>
                            <CheckIcon size={16} />
                          </IconButton>
                          <IconButton variant="sm" title="取消新增" onClick={() => {
                            const details = draft.details.filter((_, j) => j !== i);
                            patchDraft({ details });
                            setDraftEdit(null);
                          }}>
                            <XIcon size={16} />
                          </IconButton>
                        </span>
                      </div>
                      <div className="flex-col gap-12 mt-12">
                        <Input
                          value={amountVal}
                          onChange={(e) => {
                            const details = [...draft.details];
                            details[i] = { ...details[i], amount: e.target.value };
                            patchDraft({ details });
                          }}
                          placeholder="品項金額"
                          inputMode="numeric"
                          style={{ padding: 12, fontSize: 14 }}
                        />
                        {/* Tag picker */}
                        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <StarIcon size={24} />
                          <div style={{
                            flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 12px", border: "1px solid var(--ln-control)", borderRadius: 99, background: "#fff",
                          }}>
                            <button
                              style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8, border: "none", background: "none", padding: 0, textAlign: "left", cursor: "pointer" }}
                              onClick={() => setTagPick(`draft-${i}`)}
                            >
                              {d.tags.length > 0 ? (
                                <Chip label={d.tags[0]} kind="item" />
                              ) : (
                                <span className="fs14 text3">選擇標籤</span>
                              )}
                            </button>
                            {d.tags.length > 0 && (
                              <button
                                style={{ flex: "none", width: 22, height: 22, border: "none", borderRadius: 99, background: "var(--bg-neutral)", color: "var(--text2)", fontSize: 12, cursor: "pointer" }}
                                onClick={() => {
                                  const details = [...draft.details];
                                  details[i] = { ...details[i], tags: [] };
                                  patchDraft({ details });
                                }}
                              >
                                ×
                              </button>
                            )}
                            <button
                              style={{ flex: "none", width: 22, height: 22, border: "none", background: "none", color: "var(--text2)", cursor: "pointer" }}
                              onClick={() => setTagPick(`draft-${i}`)}
                            >
                              <ChevDownIcon size={16} />
                            </button>
                          </div>
                          {tagPick === `draft-${i}` && (
                            <>
                              <div className="picker-backdrop" onClick={() => setTagPick(null)} />
                              <div className="picker-panel" style={{ left: 26 }}>
                                {itemTags.map((t) => (
                                  <button
                                    key={t}
                                    className={`picker-row${d.tags.includes(t) ? " is-sel" : ""}`}
                                    onClick={() => {
                                      const details = [...draft.details];
                                      details[i] = { ...details[i], tags: [t] };
                                      patchDraft({ details });
                                      setTagPick(null);
                                    }}
                                  >
                                    {t}
                                    <span>{d.tags.includes(t) ? "✓" : ""}</span>
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        <Input
                          value={d.note}
                          onChange={(e) => {
                            const details = [...draft.details];
                            details[i] = { ...details[i], note: e.target.value };
                            patchDraft({ details });
                          }}
                          placeholder="其他備註"
                          style={{ padding: 12, fontSize: 14 }}
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            {draft.details.length === 0 && (
              <>
                <div className="empty-box" style={{ borderStyle: "dashed" }}>
                  尚無明細<br />可只上傳收據，或按右上＋新增明細
                </div>
                <div className="fs14" style={{ color: "var(--danger)" }}>請至少上傳收據或新增一筆明細</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
