"use client";

import { useParams } from "next/navigation";
import { useStore } from "@/store";
import Chip from "@/components/ui/Chip";
import IconButton from "@/components/ui/IconButton";
import ErrorBanner from "@/components/ui/ErrorBanner";
import {
  EditIcon, CheckIcon, PlusIcon, TrashIcon, XIcon,
  ChevDownIcon, ChevRightIcon,
} from "@/components/icons";
import { effLabel, restLabel as calcRestLabel, matchCount, ruleTagUsed } from "@/lib/calculations";

export default function RulesPage() {
  const params = useParams();
  const eventId = Number(params.eventId);

  const openMenu = useStore((s) => s.openMenu);
  const role = useStore((s) => s.role);
  const rules = useStore((s) => s.rules);
  const setRules = useStore((s) => s.setRules);
  const itemTags = useStore((s) => s.itemTags);
  const setItemTags = useStore((s) => s.setItemTags);
  const condTags = useStore((s) => s.condTags);
  const setCondTags = useStore((s) => s.setCondTags);
  const members = useStore((s) => s.members);
  const itemsBy = useStore((s) => s.itemsBy);
  const ruleEdit = useStore((s) => s.ruleEdit);
  const setRuleEdit = useStore((s) => s.setRuleEdit);
  const tagEdit = useStore((s) => s.tagEdit);
  const setTagEdit = useStore((s) => s.setTagEdit);
  const tagMenu = useStore((s) => s.tagMenu);
  const setTagMenu = useStore((s) => s.setTagMenu);
  const tagUsedAsk = useStore((s) => s.tagUsedAsk);
  const setTagUsedAsk = useStore((s) => s.setTagUsedAsk);
  const secShut = useStore((s) => s.secShut);
  const setSecShut = useStore((s) => s.setSecShut);
  const secEdit = useStore((s) => s.secEdit);
  const setSecEdit = useStore((s) => s.setSecEdit);

  const canEditRules = role === "host" || role === "co";
  const items = itemsBy[eventId] || [];

  const itemOpen = !secShut["item"];
  const condOpen = !secShut["cond"];
  const ruleOpen = !secShut["rule"];
  const itemViewOn = !secEdit["item"];
  const itemEditOn = secEdit["item"];
  const condViewOn = !secEdit["cond"];
  const condEditOn = secEdit["cond"];
  const ruleViewOn = !secEdit["rule"];
  const ruleEditOn = secEdit["rule"];

  const toggleSection = (key: string) => setSecShut({ [key]: !secShut[key] });
  const toggleEdit = (key: string) => setSecEdit({ [key]: !secEdit[key] });

  const handleAddItemTag = () => {
    setItemTags([...itemTags, ""]);
    setTagEdit({ kind: "item", i: itemTags.length, value: "", isNew: true });
  };

  const handleAddCondTag = () => {
    setCondTags([...condTags, ""]);
    setTagEdit({ kind: "cond", i: condTags.length, value: "", isNew: true });
  };

  return (
    <div className="page-shell">
      <div className="topbar">
        <div className="topbar-row topbar-row--start">
          <button className="icon-btn hamburger" title="更多操作" onClick={openMenu}>
            <span /><span /><span />
          </button>
          <span className="topbar-title">分攤規則</span>
        </div>
      </div>

      {!canEditRules && (
        <div className="mt-16" style={{
          padding: "12px 14px", borderRadius: 8, background: "var(--bg-neutral)",
          fontSize: 14, color: "var(--text2)", lineHeight: 1.7,
        }}>
          非主辦者／協辦者不可編輯分攤規則
        </div>
      )}

      {tagUsedAsk && (
        <ErrorBanner
          message={tagUsedAsk.text}
          onClose={() => setTagUsedAsk(null)}
        />
      )}

      {/* Item Tags Section */}
      <div className="mt-20 flex items-center between gap-10">
        <IconButton variant="sm" style={{ border: "none" }} title="收合／展開" onClick={() => toggleSection("item")}>
          {itemOpen ? <ChevDownIcon size={16} /> : <ChevRightIcon size={16} />}
        </IconButton>
        <span className="grow section-title">項目標籤（記帳項目用）</span>
        {canEditRules && (
          itemViewOn ? (
            <IconButton variant="sm" title="編輯" onClick={() => toggleEdit("item")}>
              <EditIcon size={16} />
            </IconButton>
          ) : (
            <IconButton variant="sm-fill" title="完成" onClick={() => toggleEdit("item")}>
              <CheckIcon size={16} />
            </IconButton>
          )
        )}
      </div>
      {itemOpen && itemViewOn && (
        <div className="mt-10 flex wrap gap-8" style={{ marginLeft: 40 }}>
          {itemTags.map((t) => (
            <Chip key={t} label={t} kind="item" md />
          ))}
        </div>
      )}
      {itemOpen && itemEditOn && (
        <div className="mt-10 flex wrap items-center gap-8" style={{ marginLeft: 40 }}>
          {itemTags.map((t, i) => {
            const isEditing = tagEdit?.kind === "item" && tagEdit.i === i;
            const isMenu = tagMenu?.kind === "item" && tagMenu.i === i;
            if (isEditing) {
              return (
                <input
                  key={i}
                  className={`input${tagEdit.dup ? " input--err" : ""}`}
                  style={{ width: 118, padding: "6px 12px", borderRadius: 99, fontSize: 14 }}
                  value={tagEdit.value}
                  onChange={(e) => setTagEdit({ ...tagEdit, value: e.target.value })}
                  onBlur={() => {
                    if (tagEdit.value.trim()) {
                      const updated = [...itemTags];
                      updated[i] = tagEdit.value.trim();
                      setItemTags(updated);
                    }
                    setTagEdit(null);
                  }}
                  autoFocus
                />
              );
            }
            if (isMenu) {
              return (
                <span key={i} style={{
                  position: "relative", display: "flex", alignItems: "center", gap: 1,
                  border: "2px solid var(--tag-item-bg-sel)", background: "var(--tag-item-fg-sel)",
                  borderRadius: 99, padding: "0 4px 0 0",
                }}>
                  <span style={{ fontSize: 14, fontWeight: 500, padding: "6px 4px 6px 12px", color: "var(--tag-item-fg)" }}>{t}</span>
                  <button
                    style={{ width: 22, height: 22, border: "none", borderRadius: 99, background: "none", color: "var(--tag-item-fg)", fontSize: 14, cursor: "pointer" }}
                    onClick={() => setTagMenu(null)}
                  >
                    ⋮
                  </button>
                  <span className="dropdown-menu" style={{ left: 0, top: "calc(100% + 6px)" }}>
                    <button onClick={() => {
                      const updated = itemTags.filter((_, j) => j !== i);
                      setItemTags(updated);
                      setTagMenu(null);
                    }}>
                      <TrashIcon size={14} />刪除
                    </button>
                    <button onClick={() => {
                      setTagMenu(null);
                      setTagEdit({ kind: "item", i, value: t });
                    }}>
                      <EditIcon size={14} />編輯
                    </button>
                  </span>
                </span>
              );
            }
            return (
              <span key={i} style={{
                display: "flex", alignItems: "center", gap: 1,
                border: "1px solid #E4C374", background: "var(--tag-item-bg)",
                borderRadius: 99, padding: "0 4px 0 0",
              }}>
                <span style={{ fontSize: 14, padding: "6px 4px 6px 12px", color: "var(--tag-item-fg)" }}>{t}</span>
                <button
                  style={{ width: 22, height: 22, border: "none", borderRadius: 99, background: "none", color: "var(--tag-item-fg)", fontSize: 14, cursor: "pointer" }}
                  onClick={() => setTagMenu({ kind: "item", i })}
                >
                  ⋮
                </button>
              </span>
            );
          })}
          <button
            className="pill-dashed"
            style={{ borderStyle: "dashed", borderColor: "var(--tag-item-bg)" }}
            onClick={handleAddItemTag}
          >
            ＋ 新增項目標籤
          </button>
        </div>
      )}

      {/* Cond Tags Section */}
      <div className="mt-24 flex items-center between gap-10">
        <IconButton variant="sm" style={{ border: "none" }} title="收合／展開" onClick={() => toggleSection("cond")}>
          {condOpen ? <ChevDownIcon size={16} /> : <ChevRightIcon size={16} />}
        </IconButton>
        <span className="grow section-title">人員條件（人員定義用）</span>
        {canEditRules && (
          condViewOn ? (
            <IconButton variant="sm" title="編輯" onClick={() => toggleEdit("cond")}>
              <EditIcon size={16} />
            </IconButton>
          ) : (
            <IconButton variant="sm-fill" title="完成" onClick={() => toggleEdit("cond")}>
              <CheckIcon size={16} />
            </IconButton>
          )
        )}
      </div>
      {condOpen && condViewOn && (
        <div className="mt-10 flex wrap gap-8" style={{ marginLeft: 40 }}>
          {condTags.map((t) => (
            <Chip key={t} label={t} kind="cond" md hash />
          ))}
        </div>
      )}
      {condOpen && condEditOn && (
        <div className="mt-10 flex wrap items-center gap-8" style={{ marginLeft: 40 }}>
          {condTags.map((t, i) => {
            const isEditing = tagEdit?.kind === "cond" && tagEdit.i === i;
            const isMenu = tagMenu?.kind === "cond" && tagMenu.i === i;
            if (isEditing) {
              return (
                <input
                  key={i}
                  className={`input${tagEdit.dup ? " input--err" : ""}`}
                  style={{ width: 118, padding: "6px 12px", borderRadius: 99, fontSize: 14 }}
                  value={tagEdit.value}
                  onChange={(e) => setTagEdit({ ...tagEdit, value: e.target.value })}
                  onBlur={() => {
                    if (tagEdit.value.trim()) {
                      const updated = [...condTags];
                      updated[i] = tagEdit.value.trim();
                      setCondTags(updated);
                    }
                    setTagEdit(null);
                  }}
                  autoFocus
                />
              );
            }
            if (isMenu) {
              return (
                <span key={i} style={{
                  position: "relative", display: "flex", alignItems: "center", gap: 1,
                  border: "2px solid var(--tag-cond-fg)", background: "var(--tag-cond-bg-sel)",
                  borderRadius: 99, padding: "0 4px 0 0",
                }}>
                  <span style={{ fontSize: 14, fontWeight: 500, padding: "6px 4px 6px 12px", color: "#9C4B5B" }}>{t}</span>
                  <button
                    style={{ width: 22, height: 22, border: "none", borderRadius: 99, background: "none", color: "var(--tag-item-fg)", fontSize: 14, cursor: "pointer" }}
                    onClick={() => setTagMenu(null)}
                  >
                    ⋮
                  </button>
                  <span className="dropdown-menu" style={{ left: 0, top: "calc(100% + 6px)" }}>
                    <button onClick={() => {
                      const updated = condTags.filter((_, j) => j !== i);
                      setCondTags(updated);
                      setTagMenu(null);
                    }}>
                      <TrashIcon size={14} />刪除
                    </button>
                    <button onClick={() => {
                      setTagMenu(null);
                      setTagEdit({ kind: "cond", i, value: t });
                    }}>
                      <EditIcon size={14} />編輯
                    </button>
                  </span>
                </span>
              );
            }
            return (
              <span key={i} style={{
                display: "flex", alignItems: "center", gap: 1,
                border: "1px solid #E0AEB8", background: "var(--tag-cond-bg)",
                borderRadius: 99, padding: "0 4px 0 0",
              }}>
                <span style={{ fontSize: 14, padding: "6px 4px 6px 12px", color: "var(--tag-cond-fg)" }}>{t}</span>
                <button
                  style={{ width: 22, height: 22, border: "none", borderRadius: 99, background: "none", color: "var(--teal-deep)", fontSize: 14, cursor: "pointer" }}
                  onClick={() => setTagMenu({ kind: "cond", i })}
                >
                  ⋮
                </button>
              </span>
            );
          })}
          <button
            className="pill-dashed"
            style={{ borderStyle: "dashed", borderColor: "var(--tag-cond-bg)" }}
            onClick={handleAddCondTag}
          >
            ＋ 新增人員條件
          </button>
        </div>
      )}

      {/* Rules Section */}
      <div className="mt-24 flex items-center between gap-10">
        <IconButton variant="sm" style={{ border: "none" }} title="收合／展開" onClick={() => toggleSection("rule")}>
          {ruleOpen ? <ChevDownIcon size={16} /> : <ChevRightIcon size={16} />}
        </IconButton>
        <span className="grow section-title">條件式分攤規則</span>
        <span className="flex items-center gap-8">
          {ruleEditOn && (
            <IconButton
              variant="sm"
              style={{ border: "1px solid #B9C6C3" }}
              title="新增規則"
              onClick={() => setRules([...rules, { tag: "", groups: [{ conds: [], mode: "exclude", wt: "" }] }])}
            >
              <PlusIcon size={19} />
            </IconButton>
          )}
          {canEditRules && (
            ruleViewOn ? (
              <IconButton variant="sm" title="編輯" onClick={() => toggleEdit("rule")}>
                <EditIcon size={16} />
              </IconButton>
            ) : (
              <IconButton variant="sm-fill" title="完成" onClick={() => toggleEdit("rule")}>
                <CheckIcon size={16} />
              </IconButton>
            )
          )}
        </span>
      </div>
      {ruleOpen && (
        <div className="fs12 text3 mt-6" style={{ lineHeight: 1.7, marginLeft: 40 }}>
          依據項目標籤與人員條件；未被設定到的人員與未設定規則的項目，皆採均分。
        </div>
      )}

      {ruleOpen && ruleViewOn && (
        <div className="flex-col gap-16 mt-12">
          {rules.map((r, i) => {
            const used = ruleTagUsed(r.tag, items);
            return (
              <div key={i} className="card" style={{ padding: "14px 16px", marginLeft: 40, marginRight: 40 }}>
                <div className="flex items-center between gap-10">
                  <span className="grow fs16 fw500">{r.tag}</span>
                  {used && <span className="pill-neutral">已被使用</span>}
                </div>
                <div className="flex-col gap-8 mt-10">
                  {r.groups.map((g, j) => (
                    <div key={j} className="flex items-center gap-10">
                      <span className="grow flex wrap items-center gap-6">
                        {g.conds.map((c) => (
                          <Chip key={c} label={c} kind="cond" />
                        ))}
                        <span className="fs12 text3">{matchCount(g.conds, members)} 人</span>
                      </span>
                      <span className="fs14 fw500" style={{ flex: "none" }}>{effLabel(g)}</span>
                    </div>
                  ))}
                </div>
                <div
                  className="flex items-center between gap-10 mt-12"
                  style={{ paddingTop: 10, borderTop: "1px solid var(--ln-control)" }}
                >
                  <span className="grow fs12 text3">其他人員</span>
                  <span className="fs14 fw500">{calcRestLabel(r)}</span>
                </div>
              </div>
            );
          })}
          {rules.length === 0 && (
            <div className="fs14 text3" style={{ marginLeft: 40 }}>
              尚未設定標籤規則，所有款項皆採均分。
            </div>
          )}
        </div>
      )}

      {ruleOpen && ruleEditOn && (
        <div className="flex-col gap-12 mt-12">
          {rules.map((r, i) => {
            const used = ruleTagUsed(r.tag, items);
            const isEditing = ruleEdit === i;
            return (
              <div key={i} className="card" style={{ padding: "16px 20px", marginLeft: 40, marginRight: 40 }}>
                <div className="flex items-center between gap-12">
                  <span className="grow fs16 fw700" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.tag || "（未選擇標籤）"}
                  </span>
                  {used && <span className="pill-neutral">已被使用</span>}
                  {!isEditing && !used && (
                    <span className="flex gap-8">
                      <IconButton variant="sm" title="刪除" onClick={() => setRules(rules.filter((_, j) => j !== i))}>
                        <TrashIcon size={14} />
                      </IconButton>
                      <IconButton variant="sm-fill" title="編輯" onClick={() => setRuleEdit(i)}>
                        <EditIcon size={14} />
                      </IconButton>
                    </span>
                  )}
                  {isEditing && (
                    <span className="flex gap-8">
                      <IconButton variant="sm" title="取消" onClick={() => setRuleEdit(null)}>
                        <XIcon size={14} />
                      </IconButton>
                      <IconButton variant="sm-fill" title="儲存" onClick={() => setRuleEdit(null)}>
                        <CheckIcon size={14} />
                      </IconButton>
                    </span>
                  )}
                </div>
                <div className="mt-14" style={{ paddingTop: 12, borderTop: "1px solid var(--ln-control)" }}>
                  <div className="fs14 fw500">分攤規則</div>
                </div>
                <div className="flex-col gap-10 mt-10">
                  {r.groups.map((g, j) => (
                    <div key={j} className="flex items-center gap-10">
                      <span className="grow flex wrap items-center gap-6">
                        {g.conds.map((c) => (
                          <Chip key={c} label={c} kind="cond" />
                        ))}
                        <span className="fs12 text3">{matchCount(g.conds, members)} 人</span>
                      </span>
                      <span className="fs14 fw500" style={{ flex: "none" }}>{effLabel(g)}</span>
                    </div>
                  ))}
                </div>
                <div
                  className="flex items-center between gap-10 mt-14"
                  style={{ paddingTop: 12, borderTop: "1px solid var(--ln-control)" }}
                >
                  <span className="grow fs12 text2">其他人員</span>
                  <span className="fs14 fw500">{calcRestLabel(r)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
