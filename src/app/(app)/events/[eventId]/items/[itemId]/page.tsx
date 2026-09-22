"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/store";
import Input from "@/components/ui/Input";
import IconButton from "@/components/ui/IconButton";
import Chip from "@/components/ui/Chip";
import { BackIcon, CheckIcon, PlusIcon, EditIcon, TrashIcon, StarIcon, ChevDownIcon } from "@/components/icons";
import { money, num } from "@/lib/formatters";
import { getEvent, getItem, updateItem, deleteItem, getItemTags } from "@/api/event";
import type { EventDetailDetail } from "@/api/event";
import type { EventDetailMember } from "@/api/mombers";

interface LocalDetail {
  name: string;
  amount: string;
  tags: string[];
  note: string;
  custom_shares: Record<string, number>;
}

function apiDetailToLocal(d: EventDetailDetail): LocalDetail {
  return {
    name: d.name,
    amount: String(d.amount ?? 0),
    tags: d.tag ? [d.tag] : [],
    note: d.note || "",
    custom_shares: d.custom_amounts ?? d.custom_shares ?? {},
  };
}

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);
  const itemId = Number(params.itemId);

  const editDetail = useStore((s) => s.editDetail);
  const setEditDetail = useStore((s) => s.setEditDetail);
  const itemTags = useStore((s) => s.itemTags);
  const setItemTags = useStore((s) => s.setItemTags);
  const tagPick = useStore((s) => s.tagPick);
  const setTagPick = useStore((s) => s.setTagPick);
  const setDelAsk = useStore((s) => s.setDelAsk);

  const [details, setDetails] = useState<LocalDetail[]>([]);
  const [members, setMembers] = useState<EventDetailMember[]>([]);
  const [payerName, setPayerName] = useState("");
  const [hasReceipt, setHasReceipt] = useState(false);
  const [myRole, setMyRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    Promise.all([
      getItem(eventId, itemId),
      getEvent(eventId),
      getItemTags(eventId),
    ])
      .then(([item, ev, tags]) => {
        setDetails(item.details.map(apiDetailToLocal));
        setHasReceipt(item.has_receipt);
        setMembers(ev.members);
        const payer = ev.members.find((m) => m.id === item.payer_member_id);
        setPayerName(payer?.display ?? "—");
        setMyRole(ev.my_role);
        setItemTags(tags);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "載入失敗"))
      .finally(() => setLoading(false));
  }, [eventId, itemId, setItemTags]);

  if (loading) return <div className="page-shell">載入中…</div>;
  if (error) return <div className="page-shell">{error}</div>;

  const canEditItem = myRole === "host" || myRole === "co";
  const total = details.reduce((sum, d) => sum + num(d.amount), 0);

  const updateDetailLocal = (detailIdx: number, patch: Partial<LocalDetail>) => {
    setDetails((prev) => prev.map((d, i) => (i === detailIdx ? { ...d, ...patch } : d)));
    setDirty(true);
  };

  const handleAddDetail = () => {
    setDetails((prev) => [...prev, { name: "", amount: "", tags: [], note: "", custom_shares: {} }]);
    setEditDetail(details.length);
    setDirty(true);
  };

  const handleRemoveDetail = (idx: number) => {
    setDetails((prev) => prev.filter((_, j) => j !== idx));
    if (editDetail === idx) setEditDetail(null);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateItem(eventId, itemId, {
        details: details.map((d) => ({
          name: d.name || "（未命名）",
          amount: Math.round(num(d.amount)),
          tag: d.tags[0] ?? "",
          note: d.note,
          custom_amounts: Object.keys(d.custom_shares).length > 0 ? d.custom_shares : undefined,
        })),
      });
      setDetails(res.details.map(apiDetailToLocal));
      setDirty(false);
      setEditDetail(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "更新款項失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    try {
      await deleteItem(eventId, itemId);
      router.push(`/events/${eventId}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "刪除款項失敗");
    }
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
            <>
              <IconButton
                variant="soft"
                title="儲存變更"
                onClick={handleSave}
                disabled={saving || !dirty}
                style={{ marginLeft: "auto" }}
              >
                <CheckIcon size={18} />
              </IconButton>
              <IconButton
                variant="danger"
                title="刪除這筆款項"
                onClick={() => setDelAsk(handleDeleteItem)}
              >
                <TrashIcon size={18} />
              </IconButton>
            </>
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
            <span className="fs18 fw700">{payerName} 代墊</span>
            <span className="fs18 fw700">{money(total)}</span>
          </div>
          <div className="receipt-drop" style={{ cursor: "default" }}>
            <span style={{ font: "11.5px/1.6 ui-monospace,Menlo,monospace", color: "var(--text2)" }}>
              {hasReceipt ? "已上傳收據" : "無收據"}
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
            {details.map((d, i) => {
              const isEditing = editDetail === i;
              return (
                <div key={i} className="card card-pad">
                  {!isEditing ? (
                    <>
                      <div className="flex between items-start gap-10">
                        <span className="grow fs16 fw500" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {d.name}
                        </span>
                        <span className="fs16 fw500">
                          {money(num(d.amount))}
                        </span>
                        {canEditItem && (
                          <span className="flex items-center gap-10" style={{ flex: "none" }}>
                            <IconButton variant="sm" title="刪除" onClick={() => handleRemoveDetail(i)}>
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
                      {Object.keys(d.custom_shares).length > 0 && (
                        <div className="mt-12">
                          <div className="fs12 text2" style={{ marginBottom: 6 }}>分攤人員</div>
                          {Object.entries(d.custom_shares).map(([mid, amount]) => {
                            const member = members.find((m) => String(m.id) === mid);
                            return (
                              <div key={mid} className="flex between items-center" style={{ padding: "2px 0" }}>
                                <span className="fs13">{member?.display ?? mid}</span>
                                <span className="fs13 text2">{money(amount)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex between items-center gap-10">
                        <Input
                          value={d.name}
                          onChange={(e) => updateDetailLocal(i, { name: e.target.value })}
                          placeholder="品項名稱"
                          style={{ flex: 1, minWidth: 0, padding: 12, fontSize: 14 }}
                        />
                        <span className="flex items-center gap-8" style={{ flex: "none" }}>
                          <IconButton variant="sm" title="刪除項目" onClick={() => handleRemoveDetail(i)}>
                            <TrashIcon size={14} />
                          </IconButton>
                          <IconButton variant="sm-fill" title="完成" onClick={() => setEditDetail(null)}>
                            <CheckIcon size={16} />
                          </IconButton>
                        </span>
                      </div>
                      <div className="flex-col gap-12 mt-12">
                        <Input
                          value={d.amount}
                          onChange={(e) => updateDetailLocal(i, { amount: e.target.value })}
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
                                onClick={() => updateDetailLocal(i, { tags: [] })}
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
                                      updateDetailLocal(i, { tags: [t] });
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
                          onChange={(e) => updateDetailLocal(i, { note: e.target.value })}
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
