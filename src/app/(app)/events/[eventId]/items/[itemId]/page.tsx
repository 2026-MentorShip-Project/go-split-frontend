"use client";

import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/store";
import Input from "@/components/ui/Input";
import IconButton from "@/components/ui/IconButton";
import Chip from "@/components/ui/Chip";
import { BackIcon, CheckIcon, PlusIcon, EditIcon, TrashIcon, XIcon, StarIcon, ChevDownIcon } from "@/components/icons";
import { money, num } from "@/lib/formatters";
import { itemTotal } from "@/lib/calculations";

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);
  const itemId = Number(params.itemId);

  const itemsBy = useStore((s) => s.itemsBy);
  const updateItemsForEvent = useStore((s) => s.updateItemsForEvent);
  const editDetail = useStore((s) => s.editDetail);
  const setEditDetail = useStore((s) => s.setEditDetail);
  const role = useStore((s) => s.role);
  const persona = useStore((s) => s.persona);
  const itemTags = useStore((s) => s.itemTags);
  const tagPick = useStore((s) => s.tagPick);
  const setTagPick = useStore((s) => s.setTagPick);
  const setDelAsk = useStore((s) => s.setDelAsk);

  const items = itemsBy[eventId] || [];
  const item = items[itemId];
  if (!item) return <div className="page-shell">款項不存在</div>;

  const canEditItem = role === "host" || persona === "host" || persona === "co";
  const total = itemTotal(item);

  const updateDetail = (detailIdx: number, patch: Partial<typeof item.details[0]>) => {
    const updated = [...items];
    const details = [...item.details];
    details[detailIdx] = { ...details[detailIdx], ...patch };
    updated[itemId] = { ...item, details };
    updateItemsForEvent(eventId, updated);
  };

  const handleAddDetail = () => {
    const updated = [...items];
    const details = [...item.details, { name: "", amount: "" as string | number, tags: [], note: "", ids: null }];
    updated[itemId] = { ...item, details };
    updateItemsForEvent(eventId, updated);
    setEditDetail(details.length - 1);
  };

  const handleRemoveItem = () => {
    const updated = items.filter((_, j) => j !== itemId);
    updateItemsForEvent(eventId, updated);
    router.push(`/events/${eventId}`);
  };

  return (
    <div className="page-shell">
      <div className="topbar">
        <div className="topbar-row">
          <IconButton onClick={() => router.push(`/events/${eventId}`)}>
            <BackIcon />
          </IconButton>
          <span className="topbar-title">款項細項</span>
          {canEditItem && (
            <IconButton
              variant="danger"
              title="刪除這筆款項"
              onClick={() => setDelAsk(handleRemoveItem)}
              style={{ marginLeft: "auto" }}
            >
              <TrashIcon size={18} />
            </IconButton>
          )}
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
          <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}>
            <span className="fs18 fw700">{item.by} 代墊</span>
            <span className="fs18 fw700">{money(total)}</span>
          </div>
          <div className="receipt-drop" style={{ cursor: "default" }}>
            <span style={{ font: "11.5px/1.6 ui-monospace,Menlo,monospace", color: "var(--text2)" }}>
              {item.receipt ? "已上傳收據" : "無收據"}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center between gap-10">
            <span className="section-title">明細</span>
            {canEditItem && (
              <IconButton variant="sm" title="新增明細" onClick={handleAddDetail}>
                <PlusIcon size={16} />
              </IconButton>
            )}
          </div>

          <div className="flex-col gap-16 mt-10">
            {item.details.map((d, i) => {
              const isEditing = editDetail === i;
              const amountVal = String(d.amount);
              return (
                <div key={i} className="card card-pad">
                  {!isEditing ? (
                    <>
                      <div className="flex between items-start gap-10">
                        <span className="grow fs16 fw500" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {d.name}
                        </span>
                        <span className="fs16 fw500">
                          {money(typeof d.amount === "number" ? d.amount : num(amountVal))}
                        </span>
                        {canEditItem && (
                          <span className="flex items-center gap-10" style={{ flex: "none" }}>
                            <IconButton variant="sm" title="刪除" onClick={() => {
                              const details = item.details.filter((_, j) => j !== i);
                              const updated = [...items];
                              updated[itemId] = { ...item, details };
                              updateItemsForEvent(eventId, updated);
                            }}>
                              <TrashIcon size={14} />
                            </IconButton>
                            <IconButton variant="sm-fill" title="編輯" onClick={() => setEditDetail(i)}>
                              <EditIcon size={14} />
                            </IconButton>
                          </span>
                        )}
                      </div>
                      <div className="mt-12 flex wrap gap-8">
                        {d.tags.map((t) => (
                          <Chip key={t} label={t} kind="item" />
                        ))}
                      </div>
                      {d.note && <div className="mt-12 fs12 text2">備註：{d.note}</div>}
                    </>
                  ) : (
                    <>
                      <div className="flex between items-center gap-10">
                        <Input
                          value={d.name}
                          onChange={(e) => updateDetail(i, { name: e.target.value })}
                          placeholder="品項名稱"
                          style={{ flex: 1, minWidth: 0, padding: 12, fontSize: 14 }}
                        />
                        <span className="flex items-center gap-8" style={{ flex: "none" }}>
                          <IconButton variant="sm" title="刪除項目" onClick={() => {
                            const details = item.details.filter((_, j) => j !== i);
                            const updated = [...items];
                            updated[itemId] = { ...item, details };
                            updateItemsForEvent(eventId, updated);
                            setEditDetail(null);
                          }}>
                            <TrashIcon size={14} />
                          </IconButton>
                          <IconButton variant="sm-fill" title="完成" onClick={() => setEditDetail(null)}>
                            <CheckIcon size={16} />
                          </IconButton>
                        </span>
                      </div>
                      <div className="flex-col gap-12 mt-12">
                        <Input
                          value={amountVal}
                          onChange={(e) => updateDetail(i, { amount: e.target.value })}
                          placeholder="品項金額"
                          inputMode="numeric"
                          style={{ padding: 12, fontSize: 14 }}
                        />
                        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <StarIcon size={24} />
                          <div style={{
                            flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 12px", border: "1px solid var(--ln-control)", borderRadius: 99, background: "#fff",
                          }}>
                            <button
                              style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8, border: "none", background: "none", padding: 0, textAlign: "left", cursor: "pointer" }}
                              onClick={() => setTagPick(`item-${i}`)}
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
                                onClick={() => updateDetail(i, { tags: [] })}
                              >
                                ×
                              </button>
                            )}
                            <button
                              style={{ flex: "none", width: 22, height: 22, border: "none", background: "none", color: "var(--text2)", cursor: "pointer" }}
                              onClick={() => setTagPick(`item-${i}`)}
                            >
                              <ChevDownIcon size={16} />
                            </button>
                          </div>
                          {tagPick === `item-${i}` && (
                            <>
                              <div className="picker-backdrop" onClick={() => setTagPick(null)} />
                              <div className="picker-panel" style={{ left: 26 }}>
                                {itemTags.map((t) => (
                                  <button
                                    key={t}
                                    className={`picker-row${d.tags.includes(t) ? " is-sel" : ""}`}
                                    onClick={() => {
                                      updateDetail(i, { tags: [t] });
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
                          onChange={(e) => updateDetail(i, { note: e.target.value })}
                          placeholder="其他備註"
                          style={{ padding: 12, fontSize: 14 }}
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
