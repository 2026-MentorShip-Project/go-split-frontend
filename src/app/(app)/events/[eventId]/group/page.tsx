"use client";

import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/store";
import Input from "@/components/ui/Input";
import IconButton from "@/components/ui/IconButton";
import Chip from "@/components/ui/Chip";
import Toast from "@/components/ui/Toast";
import { PlusIcon, CheckIcon, EditIcon, TrashIcon, XIcon } from "@/components/icons";

export default function GroupPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);

  const events = useStore((s) => s.events);
  const members = useStore((s) => s.members);
  const editMember = useStore((s) => s.editMember);
  const setEditMember = useStore((s) => s.setEditMember);
  const updateMember = useStore((s) => s.updateMember);
  const newMember = useStore((s) => s.newMember);
  const setNewMember = useStore((s) => s.setNewMember);
  const addMember = useStore((s) => s.addMember);
  const removeMember = useStore((s) => s.removeMember);
  const memberToast = useStore((s) => s.memberToast);
  const setMemberToast = useStore((s) => s.setMemberToast);
  const openMenu = useStore((s) => s.openMenu);
  const evEdit = useStore((s) => s.evEdit);
  const setEvEdit = useStore((s) => s.setEvEdit);
  const patchEvEdit = useStore((s) => s.patchEvEdit);
  const setEvents = useStore((s) => s.setEvents);
  const condTags = useStore((s) => s.condTags);
  const mTagPick = useStore((s) => s.mTagPick);
  const setMTagPick = useStore((s) => s.setMTagPick);
  const mTagQuery = useStore((s) => s.mTagQuery);
  const setMTagQuery = useStore((s) => s.setMTagQuery);
  const role = useStore((s) => s.role);
  const copied = useStore((s) => s.copied);
  const setCopied = useStore((s) => s.setCopied);

  const ev = events[eventId];
  if (!ev) return <div className="page-shell">活動不存在</div>;

  const canAddMember = role === "host" || role === "co";
  const memberAddOn = editMember === null && newMember === null;
  const inviteCode = "4KQ2-8P";
  const inviteLink = `https://go-split.app/invite/${inviteCode}`;

  const handleAddMember = () => {
    const newM = {
      id: Date.now().toString(),
      name: "",
      role: "參與者" as const,
      tags: [],
      login: "新增人員",
      guest: true,
    };
    addMember(newM);
    const idx = members.length;
    setNewMember(idx);
    setEditMember(idx);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEvEdit = () => {
    if (!evEdit) return;
    const updated = [...events];
    updated[eventId] = { ...updated[eventId], name: evEdit.name, place: evEdit.place };
    setEvents(updated);
    setEvEdit(null);
  };

  return (
    <div className="page-shell">
      <div className="topbar">
        <div className="topbar-row topbar-row--start">
          <button className="icon-btn hamburger" title="更多操作" onClick={openMenu}>
            <span /><span /><span />
          </button>
          <span className="topbar-title">群組設定</span>
        </div>
      </div>

      {/* Event Info Card */}
      <div className="card mt-16" style={{ padding: "16px 20px" }}>
        {!evEdit ? (
          <div className="flex items-start gap-12">
            <div className="grow">
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{ev.name}</div>
              <div className="mt-4 fs14 text2">{ev.date}</div>
              <div className="fs14 text2" style={{ marginTop: 2 }}>{ev.place}</div>
            </div>
            {canAddMember && (
              <IconButton
                variant="sm"
                title="編輯"
                onClick={() => setEvEdit({ name: ev.name, place: ev.place, d1: "", t1: "", d2: "", t2: "" })}
              >
                <EditIcon size={16} />
              </IconButton>
            )}
          </div>
        ) : (
          <div className="flex-col gap-16">
            <div className="flex between items-center gap-10">
              <span className="fs18 fw700">編輯活動資訊</span>
              <span className="flex gap-8">
                <IconButton variant="sm" title="取消" onClick={() => setEvEdit(null)}>
                  <XIcon size={16} />
                </IconButton>
                <IconButton variant="sm-fill" title="儲存" onClick={handleSaveEvEdit}>
                  <CheckIcon size={16} />
                </IconButton>
              </span>
            </div>
            <div>
              <div className="field-label">
                活動名稱 <span style={{ color: "var(--danger)" }}>＊</span>
              </div>
              <Input
                value={evEdit.name}
                onChange={(e) => patchEvEdit({ name: e.target.value })}
                placeholder="例：部門季末聚餐"
                error={!evEdit.name.trim()}
              />
              {!evEdit.name.trim() && <div className="field-err">請輸入活動名稱</div>}
            </div>
            <div>
              <div className="field-label">活動地點</div>
              <Input
                value={evEdit.place}
                onChange={(e) => patchEvEdit({ place: e.target.value })}
                placeholder="例：大安區 好客燒肉"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-16 flex wrap items-start gap-20">
        {/* Invite Link */}
        {canAddMember && (
          <div style={{ flex: "1 1 300px", minWidth: 0 }} className="flex-col gap-10">
            <div className="section-title">專屬邀請連結</div>
            <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="qr-placeholder">
                <span style={{ font: "11px/1.6 ui-monospace,Menlo,monospace", color: "var(--text3)" }}>
                  QR CODE<br />placeholder
                </span>
              </div>
              <div
                className="mt-14"
                style={{
                  width: "100%", padding: 12, borderRadius: 8,
                  background: "var(--bg-neutral)",
                  font: "11.5px/1.5 ui-monospace,Menlo,monospace",
                  color: "var(--text2)", wordBreak: "break-all",
                }}
              >
                {inviteLink}
              </div>
              <div className="mt-8" style={{ font: "600 16px/1 ui-monospace,Menlo,monospace", letterSpacing: ".14em" }}>
                邀請碼 {inviteCode}
              </div>
              <button className="btn btn-secondary mt-12" onClick={handleCopyLink}>
                {copied ? "已複製" : "複製連結"}
              </button>
            </div>
          </div>
        )}

        {/* Members */}
        <div style={{ flex: "2 1 380px", minWidth: 0 }}>
          <div className="flex items-center between gap-10">
            <span className="section-title">群組人員</span>
            <div className="flex items-center gap-8">
              {canAddMember && (
                <>
                  <span className="fs12 text2">{members.length} 人</span>
                  {memberAddOn ? (
                    <IconButton variant="sm" title="新增人員" onClick={handleAddMember}>
                      <PlusIcon size={15} />
                    </IconButton>
                  ) : (
                    <IconButton variant="sm-disabled" title="請先完成目前新增的人員">
                      <PlusIcon size={15} />
                    </IconButton>
                  )}
                </>
              )}
            </div>
          </div>

          {memberToast && (
            <Toast message={memberToast} onClose={() => setMemberToast(null)} />
          )}

          <div className="grid-cards mt-10">
            {members.map((m, i) => {
              const isEditing = editMember === i;
              const canEdit = canAddMember;
              const removable = i > 0 && canAddMember;

              return (
                <div key={m.id} className="card card-pad">
                  {!isEditing ? (
                    <>
                      <div className="flex between items-start gap-10">
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <div className="fs16 fw500">{m.name}</div>
                        </div>
                        {canEdit ? (
                          <span className="flex items-center gap-8" style={{ flex: "none" }}>
                            <span className="fs12 text2" style={{ whiteSpace: "nowrap" }}>{m.role}</span>
                            {removable && (
                              <IconButton variant="sm" title="刪除人員" onClick={() => removeMember(i)}>
                                <TrashIcon size={14} />
                              </IconButton>
                            )}
                            <IconButton variant="sm-fill" title="編輯人員" onClick={() => setEditMember(i)}>
                              <EditIcon size={14} />
                            </IconButton>
                          </span>
                        ) : (
                          <span className="fs12 text2" style={{ whiteSpace: "nowrap", flex: "none" }}>{m.role}</span>
                        )}
                      </div>
                      <div className="mt-4 fs12" style={{ color: "var(--tag-cond-fg)" }}>
                        {m.tags.length > 0 ? m.tags.map((t) => `#${t}`).join(" ") : "無條件"}
                      </div>
                    </>
                  ) : (
                    <div className="flex-col gap-12">
                      <div className="flex items-center gap-8">
                        <Input
                          value={m.name}
                          onChange={(e) => updateMember(i, { name: e.target.value })}
                          placeholder="姓名"
                          style={{ flex: 1, padding: "10px 12px", fontWeight: 500 }}
                        />
                        <IconButton variant="sm-fill" title="儲存" onClick={() => { setEditMember(null); setNewMember(null); }}>
                          <CheckIcon size={16} />
                        </IconButton>
                      </div>
                      <div>
                        <div className="field-label" style={{ fontSize: 16, marginBottom: 6 }}>身分</div>
                        <div className="flex wrap gap-8">
                          {(["主辦者", "協辦者", "參與者"] as const).map((r) => (
                            <button
                              key={r}
                              className="btn-pill"
                              style={{
                                fontSize: 12, padding: "6px 12px",
                                cursor: i === 0 && r !== "主辦者" ? "not-allowed" : "pointer",
                                ...(m.role === r
                                  ? { borderColor: "var(--teal-hover)", background: "rgba(111,183,183,.16)", color: "var(--teal-deep)" }
                                  : {}),
                                ...(i === 0 && r !== "主辦者" ? { opacity: 0.5 } : {}),
                              }}
                              onClick={() => {
                                if (i === 0 && r !== "主辦者") return;
                                updateMember(i, { role: r });
                              }}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="field-label" style={{ fontSize: 16, marginBottom: 6 }}>人員條件</div>
                        <div className="combo">
                          <div
                            style={{
                              display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
                              padding: "6px 10px", border: "1px solid var(--ln-control)",
                              borderRadius: 8, background: "#fff",
                            }}
                          >
                            {m.tags.map((t) => (
                              <Chip
                                key={t}
                                label={t}
                                kind="cond"
                                selected
                                onClick={() => updateMember(i, { tags: m.tags.filter((x) => x !== t) })}
                                suffix=" ×"
                              />
                            ))}
                            <input
                              style={{
                                flex: 1, minWidth: 120, border: "none", background: "none",
                                outline: "none", fontSize: 14,
                              }}
                              value={mTagQuery}
                              placeholder="搜尋或選擇條件（可多選）"
                              onChange={(e) => setMTagQuery(e.target.value)}
                              onFocus={() => setMTagPick(i)}
                            />
                          </div>
                          {mTagPick === i && (
                            <>
                              <div className="picker-backdrop" onClick={() => setMTagPick(null)} />
                              <div className="picker-panel">
                                {condTags
                                  .filter((t) => !mTagQuery || t.includes(mTagQuery))
                                  .map((t) => {
                                    const sel = m.tags.includes(t);
                                    return (
                                      <button
                                        key={t}
                                        className={`picker-row${sel ? " is-sel" : ""}`}
                                        onClick={() => {
                                          const tags = sel
                                            ? m.tags.filter((x) => x !== t)
                                            : [...m.tags, t];
                                          updateMember(i, { tags });
                                        }}
                                      >
                                        {t}
                                        <span>{sel ? "✓" : ""}</span>
                                      </button>
                                    );
                                  })}
                                {condTags.filter((t) => !mTagQuery || t.includes(mTagQuery)).length === 0 && (
                                  <div className="picker-empty">沒有符合的條件</div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="field-label" style={{ fontSize: 16, marginBottom: 6 }}>備註</div>
                        <Input
                          value={m.note || ""}
                          onChange={(e) => updateMember(i, { note: e.target.value })}
                          placeholder="其他備註"
                          style={{ padding: "10px 12px", fontSize: 14 }}
                        />
                      </div>
                      <div className="flex items-center gap-8 wrap">
                        <span className="fs14">{m.login}</span>
                      </div>
                    </div>
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
