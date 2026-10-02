"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/store";
import Input from "@/components/ui/Input";
import IconButton from "@/components/ui/IconButton";
import Chip from "@/components/ui/Chip";
import Dot from "@/components/ui/Dot";
import Dialog from "@/components/ui/Dialog";
import {
  BackIcon, CheckIcon, EditIcon, TrashIcon, StarIcon, ChevDownIcon,
  LockIcon, UnlockIcon,
} from "@/components/icons";
import { money, num } from "@/lib/formatters";
import { getEvent, getItem, updateItem, deleteItem, getItemTags, getRules } from "@/api/event";
import type { EventDetailDetail } from "@/api/event";
import { roleFromApi } from "@/api/mombers";
import { detailShares } from "@/lib/calculations";
import { PAYER_ABSORBS_NOTE, splitIssueText } from "@/lib/split-validity";
import { useSplitEngine } from "@/hooks/useSplitEngine";
import type { ItemDetail, Member, Rule } from "@/lib/types";

interface LocalDetail {
  id?: number;
  name: string;
  amount: string;
  tags: string[];
  note: string;
  // What the engine worked out, for display. Never sent back: the API treats
  // custom amounts as fixed overrides, so posting these would pin the split.
  shares: Record<string, number>;
  invalid: string | null;
  payerAbsorbs: boolean;
  customAmounts: Record<string, number>;
  manualMemberIds: number[] | null;
}

interface ShareRow {
  id: string;
  name: string;
  you: boolean;
  tags: string[];
  amount: number;
}

function apiDetailToLocal(d: EventDetailDetail): LocalDetail {
  const shares = d.allocation?.shares?.reduce<Record<string, number>>(
    (acc, s) => { acc[String(s.member_id)] = s.amount; return acc; },
    {}
  ) ?? {};
  return {
    id: d.id,
    name: d.name,
    amount: String(d.amount ?? 0),
    tags: d.tag ? [d.tag] : [],
    note: d.note || "",
    shares,
    invalid: d.allocation && d.allocation.validity !== "ok" ? d.allocation.validity : null,
    payerAbsorbs: d.allocation?.shares.some((s) => s.trace?.kind === "payer-absorbs") ?? false,
    customAmounts: d.custom_amounts ?? {},
    manualMemberIds: d.manual_member_ids ?? null,
  };
}

function toItemDetail(d: LocalDetail): ItemDetail {
  return {
    name: d.name,
    amount: d.amount,
    tags: d.tags,
    note: d.note,
    ids: d.manualMemberIds?.map(String) ?? null,
    custom: Object.keys(d.customAmounts).length > 0 ? d.customAmounts : undefined,
  };
}

function tagHasRule(tags: string[], rules: Rule[]): boolean {
  return tags.some((t) => rules.some((r) => r.tag === t));
}

function applyShareResult(detail: LocalDetail, members: Member[], rules: Rule[], payerId: string): LocalDetail {
  try {
    const result = detailShares(toItemDetail(detail), members, rules, payerId);
    const shares: Record<string, number> = {};
    for (const m of result.inc) shares[m.id] = result.map[m.id] ?? 0;
    return {
      ...detail,
      shares,
      invalid: result.validity !== "ok" ? result.validity : null,
      payerAbsorbs: result.payerAbsorbs,
    };
  } catch {
    return detail;
  }
}

function buildShareRows(
  detail: LocalDetail,
  members: Member[],
  rules: Rule[],
  engineReady: boolean,
  payerId: string,
): ShareRow[] | null {
  if (!engineReady || members.length === 0) return null;
  try {
    const result = detailShares(toItemDetail(detail), members, rules, payerId);
    return result.inc.map((m) => ({
      id: m.id,
      name: m.name,
      you: !!m.you,
      tags: m.tags ?? [],
      amount: result.map[m.id] ?? 0,
    }));
  } catch {
    return null;
  }
}

function selectedMemberIds(detail: LocalDetail, members: Member[]): number[] {
  if (detail.manualMemberIds) return detail.manualMemberIds;
  const fromShares = members
    .filter((m) => Object.prototype.hasOwnProperty.call(detail.shares, m.id))
    .map((m) => Number(m.id));
  if (fromShares.length > 0) return fromShares;
  return members.map((m) => Number(m.id));
}

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);
  const itemId = Number(params.itemId);
  const { ready: engineReady } = useSplitEngine();

  const editDetail = useStore((s) => s.editDetail);
  const setEditDetail = useStore((s) => s.setEditDetail);
  const itemTags = useStore((s) => s.itemTags);
  const setItemTags = useStore((s) => s.setItemTags);
  const tagPick = useStore((s) => s.tagPick);
  const setTagPick = useStore((s) => s.setTagPick);

  const [details, setDetails] = useState<LocalDetail[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [shareOpen, setShareOpen] = useState<Record<number, boolean>>({});
  const [myRole, setMyRole] = useState("");
  const [settled, setSettled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [payerId, setPayerId] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      getItem(eventId, itemId),
      getEvent(eventId),
      getItemTags(eventId),
      getRules(eventId),
    ])
      .then(([item, ev, tags, rl]) => {
        setDetails(item.details.map(apiDetailToLocal));
        setPayerId(String(item.payer_member_id));
        setMembers((ev.members ?? []).map((m) => ({
          id: String(m.id),
          name: m.display,
          role: roleFromApi(m.role),
          tags: m.tags ?? [],
          login: "",
          guest: m.guest,
          note: m.note,
          you: m.you,
        })));
        setRules(rl);
        setMyRole(ev.my_role);
        setSettled(ev.settled);
        setItemTags(tags);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "載入失敗"))
      .finally(() => setLoading(false));
  }, [eventId, itemId, setItemTags]);

  if (loading) return <div className="page-shell">載入中…</div>;
  if (error) return <div className="page-shell">{error}</div>;

  const canEditItem = !settled && (myRole === "host" || myRole === "co");

  const patchDetail = (detailIdx: number, patch: Partial<LocalDetail>, recalc = false) => {
    setDetails((prev) => prev.map((d, i) => {
      if (i !== detailIdx) return d;
      let next: LocalDetail = { ...d, ...patch };
      if (recalc && engineReady && members.length > 0) {
        next = applyShareResult(next, members, rules, payerId);
      }
      return next;
    }));
    setDirty(true);
  };

  const handleRemoveDetail = (idx: number) => {
    setDetails((prev) => prev.filter((_, j) => j !== idx));
    if (editDetail === idx) setEditDetail(null);
    setDirty(true);
  };

  const handleToggleMember = (detailIdx: number, memberId: string) => {
    const detail = details[detailIdx];
    if (!detail || tagHasRule(detail.tags, rules)) return;

    const mid = Number(memberId);
    const current = selectedMemberIds(detail, members);
    const isOn = current.includes(mid);
    const nextIds = isOn ? current.filter((id) => id !== mid) : [...current, mid];

    const customAmounts = { ...detail.customAmounts };
    if (isOn) delete customAmounts[memberId];

    // All selected + no customs → back to automatic (null)
    const allSelected =
      nextIds.length === members.length &&
      members.every((m) => nextIds.includes(Number(m.id)));
    const manualMemberIds =
      allSelected && Object.keys(customAmounts).length === 0 ? null : nextIds;

    patchDetail(detailIdx, { manualMemberIds, customAmounts }, true);
  };

  const handleToggleLock = (detailIdx: number, memberId: string) => {
    const detail = details[detailIdx];
    if (!detail || tagHasRule(detail.tags, rules)) return;
    if (!(memberId in detail.shares)) return;

    const customAmounts = { ...detail.customAmounts };
    if (memberId in customAmounts) {
      delete customAmounts[memberId];
    } else {
      customAmounts[memberId] = detail.shares[memberId] ?? 0;
    }

    const current = selectedMemberIds(detail, members);
    patchDetail(detailIdx, {
      customAmounts,
      manualMemberIds: detail.manualMemberIds ?? current,
    }, true);
  };

  const handleCustomAmount = (detailIdx: number, memberId: string, raw: string) => {
    const detail = details[detailIdx];
    if (!detail || tagHasRule(detail.tags, rules)) return;

    const customAmounts = {
      ...detail.customAmounts,
      [memberId]: num(raw),
    };
    patchDetail(detailIdx, { customAmounts }, true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateItem(eventId, itemId, {
        details: details.map((d) => {
          const ruled = tagHasRule(d.tags, rules);
          return {
            id: d.id,
            name: d.name || "（未命名）",
            amount: Math.round(num(d.amount)),
            tag: d.tags[0] ?? "",
            note: d.note,
            custom_amounts: !ruled && Object.keys(d.customAmounts).length > 0
              ? d.customAmounts
              : undefined,
            manual_member_ids: ruled ? null : d.manualMemberIds,
          };
        }),
      });
      setDetails(res.details.map(apiDetailToLocal));
      setDirty(false);
      setEditDetail(null);
      router.push(`/events/${eventId}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "更新款項失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteItem(eventId, itemId);
      setShowDeleteDialog(false);
      router.push(`/events/${eventId}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "刪除款項失敗");
      setDeleting(false);
    }
  };

  const renderSharePreview = (detail: LocalDetail, index: number) => {
    const rows = buildShareRows(detail, members, rules, engineReady, payerId);
    const open = shareOpen[index] !== false;
    const count = rows?.length ?? 0;

    return (
      <div className="card mt-14" style={{ padding: "14px 16px" }}>
        <div className="flex between items-center gap-10">
          <button
            type="button"
            style={{
              border: "none", background: "none", padding: 0, display: "flex",
              alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)",
              letterSpacing: ".06em", cursor: "pointer",
            }}
            onClick={() => setShareOpen((prev) => ({ ...prev, [index]: !open }))}
          >
            <span className="text3 fs12">{open ? "▼" : "▶"}</span>
            共計 {rows === null ? "…" : count} 人分攤
          </button>
        </div>
        {open && rows && (
          <div className="grid-cards mt-10">
            {rows.map((row) => (
              <div key={row.id} className="flex between items-start gap-8">
                <div style={{ flex: "none", minWidth: 0 }} className="flex-col gap-4">
                  <span className="fs14">{row.name}{row.you ? "（你）" : ""}</span>
                  {row.tags.length > 0 && (
                    <span className="fs12" style={{ color: "var(--tag-cond-fg)" }}>
                      {row.tags.map((t) => `#${t}`).join("、")}
                    </span>
                  )}
                </div>
                <span
                  className="grow fs14 text2"
                  style={{ textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {money(row.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderShareEditor = (detail: LocalDetail, index: number) => {
    const open = shareOpen[index] !== false;
    const ruled = tagHasRule(detail.tags, rules);
    const selectedSet = (() => {
      if (detail.manualMemberIds) {
        return new Set(detail.manualMemberIds.map(String));
      }
      if (Object.keys(detail.shares).length > 0) {
        return new Set(Object.keys(detail.shares));
      }
      return new Set(members.map((m) => m.id));
    })();

    const count = [...selectedSet].filter((id) => members.some((m) => m.id === id)).length;

    return (
      <div className="card mt-14" style={{ padding: "14px 16px" }}>
        <div className="flex between items-center gap-10">
          <button
            type="button"
            style={{
              border: "none", background: "none", padding: 0, display: "flex",
              alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)",
              letterSpacing: ".06em", cursor: "pointer",
            }}
            onClick={() => setShareOpen((prev) => ({ ...prev, [index]: !open }))}
          >
            <span className="text3 fs12">{open ? "▼" : "▶"}</span>
            共計 {count} 人分攤
          </button>
        </div>

        {open && (
          <div className="flex-col gap-10 mt-12">
            {members.map((m) => {
              const isOn = selectedSet.has(m.id);
              const isCustom = m.id in detail.customAmounts;
              const amount = detail.shares[m.id] ?? detail.customAmounts[m.id] ?? 0;

              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "10px 12px",
                    border: "1px solid var(--ln-card)",
                    borderRadius: 8,
                    background: "#fff",
                  }}
                >
                  <button
                    type="button"
                    style={{
                      flex: 1, minWidth: 0, border: "none", background: "none", padding: 0,
                      display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                      cursor: ruled ? "default" : "pointer",
                    }}
                    onClick={() => handleToggleMember(index, m.id)}
                    disabled={ruled}
                  >
                    <Dot selected={isOn} />
                    <span style={{ minWidth: 0 }} className="flex-col gap-4">
                      <span className="fs14">{m.name}{m.you ? "（你）" : ""}</span>
                      {m.tags.length > 0 && (
                        <span className="fs12" style={{ color: "var(--tag-cond-fg)" }}>
                          {m.tags.map((t) => `#${t}`).join("、")}
                        </span>
                      )}
                    </span>
                  </button>

                  {!isOn ? (
                    <span className="fs14 text3" style={{ flex: "none" }}>—</span>
                  ) : (
                    <span className="flex items-center gap-6">
                      <span className="fs12 text2">NT$</span>
                      <input
                        style={{
                          width: 74,
                          padding: "8px 10px",
                          border: "1px solid var(--ln-control)",
                          borderRadius: 6,
                          fontSize: 14,
                          fontWeight: 500,
                          textAlign: "right",
                          background: isCustom && !ruled ? "#fff" : "var(--bg-neutral)",
                          color: isCustom && !ruled ? "var(--text)" : "var(--text3)",
                        }}
                        readOnly={ruled || !isCustom}
                        inputMode="numeric"
                        value={Math.round(amount)}
                        placeholder={String(Math.round(amount))}
                        onChange={(e) => handleCustomAmount(index, m.id, e.target.value)}
                      />
                      {!ruled && (
                        <button
                          type="button"
                          style={{
                            flex: "none", width: 32, height: 32, border: "none",
                            background: "none", color: "var(--text3)", cursor: "pointer",
                          }}
                          title={isCustom ? "鎖定以自動分配" : "解鎖以自訂金額"}
                          onClick={() => handleToggleLock(index, m.id)}
                        >
                          {isCustom ? <UnlockIcon size={15} /> : <LockIcon size={15} />}
                        </button>
                      )}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
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
                disabled={saving || !dirty || details.length === 0 || details.some((d) => d.invalid)}
                style={{ marginLeft: "auto" }}
              >
                <CheckIcon size={18} />
              </IconButton>
              <IconButton
                variant="danger"
                title="刪除這筆款項"
                onClick={() => setShowDeleteDialog(true)}
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
                      {d.invalid && (
                        <div className="fs12 mt-12" style={{ color: "var(--danger)" }}>
                          {splitIssueText(d.invalid)}
                        </div>
                      )}
                      {d.payerAbsorbs && (
                        <div className="fs12 mt-12" style={{ color: "var(--tag-item-fg)" }}>{PAYER_ABSORBS_NOTE}</div>
                      )}
                      {renderSharePreview(d, i)}
                    </>
                  ) : (
                    <>
                      <div className="flex between items-center gap-10">
                        <Input
                          value={d.name}
                          onChange={(e) => patchDetail(i, { name: e.target.value })}
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
                          onChange={(e) => patchDetail(i, { amount: e.target.value }, true)}
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
                                onClick={() => patchDetail(i, {
                                  tags: [],
                                  manualMemberIds: d.manualMemberIds,
                                  customAmounts: d.customAmounts,
                                }, true)}
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
                                      const nextTags = [t];
                                      const ruled = tagHasRule(nextTags, rules);
                                      patchDetail(i, {
                                        tags: nextTags,
                                        ...(ruled
                                          ? { manualMemberIds: null, customAmounts: {} }
                                          : {}),
                                      }, true);
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
                          onChange={(e) => patchDetail(i, { note: e.target.value })}
                          placeholder="其他備註"
                          style={{ padding: 12, fontSize: 14 }}
                        />
                      </div>
                      {d.invalid && (
                        <div className="fs12 mt-12" style={{ color: "var(--danger)" }}>
                          {splitIssueText(d.invalid)}
                        </div>
                      )}
                      {d.payerAbsorbs && (
                        <div className="fs12 mt-12" style={{ color: "var(--tag-item-fg)" }}>{PAYER_ABSORBS_NOTE}</div>
                      )}
                      {renderShareEditor(d, i)}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showDeleteDialog && (
        <Dialog
          title="刪除這筆款項"
          body="刪除後無法復原，確定要刪除嗎？"
          danger
          onClose={() => setShowDeleteDialog(false)}
          actions={
            <>
              <button
                className="btn-pill"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
              >
                取消
              </button>
              <button
                className="btn-pill"
                style={{ background: "var(--danger)", color: "#fff", border: "none" }}
                onClick={() => void handleDeleteItem()}
                disabled={deleting}
              >
                {deleting ? "刪除中…" : "確認刪除"}
              </button>
            </>
          }
        />
      )}
    </div>
  );
}
