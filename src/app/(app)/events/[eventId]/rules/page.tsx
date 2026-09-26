"use client";

import { useEffect } from "react";
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
import TagPicker from "@/components/features/TagPicker";
import RuleGroupEditor from "@/components/features/RuleGroupEditor";
import { duplicateGroups, ruleProblem, validWeight } from "@/lib/rules";
import type { Rule, RuleGroup } from "@/lib/types";
import { getEventMembers, roleFromApi } from "@/api/mombers";
import {
  getItemTags, addItemTag, deleteItemTag,
  getCondTags, addCondTag, deleteCondTag,
  getRules, createRule, updateRuleApi, deleteRuleApi,
} from "@/api/event";

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
  const setMembers = useStore((s) => s.setMembers);
  const itemsBy = useStore((s) => s.itemsBy);
  const ruleEdit = useStore((s) => s.ruleEdit);
  const setRuleEdit = useStore((s) => s.setRuleEdit);
  const updateRule = useStore((s) => s.updateRule);
  const rulePick = useStore((s) => s.rulePick);
  const setRulePick = useStore((s) => s.setRulePick);
  const ruleTagQuery = useStore((s) => s.ruleTagQuery);
  const setRuleTagQuery = useStore((s) => s.setRuleTagQuery);
  const ruleCondQuery = useStore((s) => s.ruleCondQuery);
  const setRuleCondQuery = useStore((s) => s.setRuleCondQuery);
  const condPick = useStore((s) => s.condPick);
  const setCondPick = useStore((s) => s.setCondPick);
  const effPick = useStore((s) => s.effPick);
  const setEffPick = useStore((s) => s.setEffPick);
  const dragGroup = useStore((s) => s.dragGroup);
  const setDragGroup = useStore((s) => s.setDragGroup);
  const ruleError = useStore((s) => s.ruleError);
  const setRuleError = useStore((s) => s.setRuleError);
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

  const canEditRules = role === "host";
  const items = itemsBy[eventId] || [];

  useEffect(() => {
    if (!eventId) return;
    void Promise.all([getItemTags(eventId), getCondTags(eventId), getRules(eventId)])
      .then(([it, ct, rl]) => { setItemTags(it); setCondTags(ct); setRules(rl); })
      .catch(() => {});
    void getEventMembers(eventId)
      .then((list) => setMembers(list.map((m) => ({
        id: String(m.id),
        name: m.display,
        role: roleFromApi(m.role),
        tags: m.tags,
        login: "",
        guest: m.guest,
        you: m.you,
      }))))
      .catch(() => {});
  }, [eventId]);

  const handleItemTagSave = async (i: number) => {
    if (!tagEdit) return;
    const newVal = tagEdit.value.trim();
    const isNew = tagEdit.isNew ?? false;
    const oldVal = itemTags[i];
    if (!newVal) {
      if (isNew) setItemTags(itemTags.filter((_, j) => j !== i));
      setTagEdit(null);
      return;
    }
    const updated = [...itemTags];
    updated[i] = newVal;
    setItemTags(updated);
    setTagEdit(null);
    try {
      let labels: string[];
      if (isNew) {
        labels = await addItemTag(eventId, newVal);
      } else if (newVal !== oldVal) {
        labels = await addItemTag(eventId, newVal);
        await deleteItemTag(eventId, oldVal);
        labels = labels.filter((l) => l !== oldVal);
      } else {
        return;
      }
      setItemTags(labels);
    } catch {
      setItemTags(await getItemTags(eventId).catch(() => itemTags));
    }
  };

  const handleDeleteItemTag = async (label: string) => {
    setTagMenu(null);
    setItemTags(itemTags.filter((t) => t !== label));
    try {
      await deleteItemTag(eventId, label);
    } catch {
      setItemTags(await getItemTags(eventId).catch(() => itemTags));
    }
  };

  const handleCondTagSave = async (i: number) => {
    if (!tagEdit) return;
    const newVal = tagEdit.value.trim();
    const isNew = tagEdit.isNew ?? false;
    const oldVal = condTags[i];
    if (!newVal) {
      if (isNew) setCondTags(condTags.filter((_, j) => j !== i));
      setTagEdit(null);
      return;
    }
    const updated = [...condTags];
    updated[i] = newVal;
    setCondTags(updated);
    setTagEdit(null);
    try {
      let labels: string[];
      if (isNew) {
        labels = await addCondTag(eventId, newVal);
      } else if (newVal !== oldVal) {
        labels = await addCondTag(eventId, newVal);
        await deleteCondTag(eventId, oldVal);
        labels = labels.filter((l) => l !== oldVal);
      } else {
        return;
      }
      setCondTags(labels);
    } catch {
      setCondTags(await getCondTags(eventId).catch(() => condTags));
    }
  };

  const handleDeleteCondTag = async (label: string) => {
    setTagMenu(null);
    setCondTags(condTags.filter((t) => t !== label));
    try {
      await deleteCondTag(eventId, label);
    } catch {
      setCondTags(await getCondTags(eventId).catch(() => condTags));
    }
  };

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

  const updateGroup = (i: number, j: number, patch: Partial<RuleGroup>) =>
    updateRule(i, {
      groups: rules[i].groups.map((g, k) => (k === j ? { ...g, ...patch } : g)),
    });

  const toggleCond = (i: number, j: number, cond: string) => {
    const conds = rules[i].groups[j].conds ?? [];
    updateGroup(i, j, {
      conds: conds.includes(cond) ? conds.filter((c) => c !== cond) : [...conds, cond],
    });
  };

  const addGroup = (i: number) =>
    updateRule(i, { groups: [...rules[i].groups, { conds: [], mode: "exclude", wt: "" }] });

  const removeGroup = (i: number, j: number) =>
    updateRule(i, { groups: rules[i].groups.filter((_, k) => k !== j) });

  // Order decides which group wins, so dragging is how a host expresses priority.
  const moveGroup = (i: number, from: number, to: number) => {
    if (from === to) return;
    const groups = [...rules[i].groups];
    const [moved] = groups.splice(from, 1);
    groups.splice(to, 0, moved);
    updateRule(i, { groups });
  };

  const restMode = (rule: Rule) => rule.rest?.mode ?? "weight";

  const closePickers = () => {
    setCondPick(null);
    setEffPick(null);
  };

  const handleCancelRule = async (i: number) => {
    const rule = rules[i];
    setRuleEdit(null);
    setRuleError(null);
    closePickers();
    if (!rule.id) {
      setRules(rules.filter((_, j) => j !== i));
      return;
    }
    setRules(await getRules(eventId).catch(() => rules));
  };

  const handleSaveRule = async (i: number) => {
    const rule = rules[i];
    const problem = ruleProblem(rule);
    if (problem) {
      setRuleError(problem);
      return;
    }
    setRuleError(null);
    setRuleEdit(null);
    closePickers();
    try {
      if (rule.id) {
        const updated = await updateRuleApi(eventId, rule.id, {
          groups: rule.groups,
          rest: rule.rest ?? null,
        });
        setRules(rules.map((r, j) => (j === i ? updated : r)));
      } else {
        const created = await createRule(eventId, {
          tag: rule.tag,
          groups: rule.groups,
          rest: rule.rest,
        });
        setRules(rules.map((r, j) => (j === i ? created : r)));
      }
    } catch (e) {
      setRuleError(e instanceof Error ? e.message : "儲存分攤規則失敗");
      setRules(await getRules(eventId).catch(() => rules));
    }
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

      {ruleError && (
        <ErrorBanner message={ruleError} onClose={() => setRuleError(null)} />
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
                  onBlur={() => void handleItemTagSave(i)}
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
                    <button onClick={() => void handleDeleteItemTag(t)}>
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
                  onBlur={() => void handleCondTagSave(i)}
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
                    <button onClick={() => void handleDeleteCondTag(t)}>
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
              onClick={() => {
                setRules([...rules, { tag: "", groups: [{ conds: [], mode: "exclude", wt: "" }] }]);
                setRuleEdit(rules.length);
                setRuleError(null);
              }}
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
            const dups = duplicateGroups(r.groups ?? []);
            return (
              <div key={i} className="card" style={{ padding: "16px 20px", marginLeft: 40, marginRight: 40 }}>
                <div className="flex items-center between gap-12">
                  {isEditing ? (
                    <TagPicker
                      tags={itemTags}
                      selectedTag={r.tag || null}
                      open={rulePick === String(i)}
                      query={ruleTagQuery}
                      onOpen={() => setRulePick(String(i))}
                      onClose={() => { setRulePick(null); setRuleTagQuery(""); }}
                      onQueryChange={(e) => setRuleTagQuery(e.target.value)}
                      onSelect={(tag) => {
                        updateRule(i, { tag });
                        setRulePick(null);
                        setRuleTagQuery("");
                      }}
                      onClear={() => updateRule(i, { tag: "" })}
                      itemTags={rules.filter((_, j) => j !== i).map((rr) => rr.tag).filter(Boolean)}
                    />
                  ) : (
                    <span className="grow fs16 fw700" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.tag || "（未選擇標籤）"}
                    </span>
                  )}
                  {used && <span className="pill-neutral">已被使用</span>}
                  {!isEditing && !used && (
                    <span className="flex gap-8">
                      <IconButton variant="sm" title="刪除" onClick={async () => {
                        const removed = rules[i];
                        setRules(rules.filter((_, j) => j !== i));
                        if (removed.id) {
                          try { await deleteRuleApi(eventId, removed.id); }
                          catch { setRules(await getRules(eventId).catch(() => rules)); }
                        }
                      }}>
                        <TrashIcon size={14} />
                      </IconButton>
                      <IconButton variant="sm-fill" title="編輯" onClick={() => setRuleEdit(i)}>
                        <EditIcon size={14} />
                      </IconButton>
                    </span>
                  )}
                  {isEditing && (
                    <span className="flex gap-8">
                      <IconButton variant="sm" title="取消" onClick={() => void handleCancelRule(i)}>
                        <XIcon size={14} />
                      </IconButton>
                      <IconButton variant="sm-fill" title="儲存" onClick={() => void handleSaveRule(i)}>
                        <CheckIcon size={14} />
                      </IconButton>
                    </span>
                  )}
                </div>
                <div className="mt-14" style={{ paddingTop: 12, borderTop: "1px solid var(--ln-control)" }}>
                  <div className="flex items-center between gap-10">
                    <span className="fs14 fw500">分攤規則</span>
                    {isEditing && (
                      <IconButton variant="sm" title="新增群組" onClick={() => addGroup(i)}>
                        <PlusIcon size={16} />
                      </IconButton>
                    )}
                  </div>
                  {isEditing && (
                    <div className="fs12 text3 mt-6" style={{ lineHeight: 1.7 }}>
                      由上往下比對，第一個符合的群組生效；群組內的條件需全部符合。可拖曳調整順序。
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex-col gap-10 mt-10">
                    {r.groups.map((g, j) => {
                      const key = `${i}:${j}`;
                      const query = ruleCondQuery.toLowerCase();
                      return (
                        <RuleGroupEditor
                          key={j}
                          groupNo={j + 1}
                          chips={(g.conds ?? []).map((c) => ({
                            label: c,
                            onRemove: () => toggleCond(i, j, c),
                          }))}
                          count={`${matchCount(g.conds, members)} 人`}
                          dup={dups.has(j)}
                          queryVal={ruleCondQuery}
                          onSetQuery={(e) => setRuleCondQuery(e.target.value)}
                          onOpenPick={() => { setRuleCondQuery(""); setCondPick(key); }}
                          pickOpen={condPick === key}
                          pickRows={condTags
                            .filter((c) => !query || c.toLowerCase().includes(query))
                            .map((c) => ({
                              label: c,
                              sel: (g.conds ?? []).includes(c),
                              onToggle: () => toggleCond(i, j, c),
                            }))}
                          pickEmpty={condTags.length === 0}
                          effLabel={effLabel(g)}
                          effOpen={effPick === key}
                          onOpenEff={() => setEffPick(key)}
                          modeOpts={[
                            {
                              label: "權重", mark: "×", sel: g.mode === "weight",
                              onPick: () => { updateGroup(i, j, { mode: "weight", wt: g.wt || "1" }); setEffPick(null); },
                            },
                            {
                              label: "不計入", mark: "—", sel: g.mode === "exclude",
                              onPick: () => { updateGroup(i, j, { mode: "exclude" }); setEffPick(null); },
                            },
                          ]}
                          isWeight={g.mode === "weight"}
                          weightVal={g.wt}
                          weightInvalid={g.mode === "weight" && !validWeight(g.wt)}
                          onSetWeight={(e) => updateGroup(i, j, { wt: e.target.value })}
                          onDelete={() => removeGroup(i, j)}
                          onClosePick={closePickers}
                          opacity={dragGroup === key ? 0.4 : 1}
                          onDragStart={() => setDragGroup(key)}
                          onDragEnd={() => setDragGroup(null)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            const [fromRule, fromGroup] = (dragGroup ?? "").split(":");
                            if (fromRule === String(i)) moveGroup(i, Number(fromGroup), j);
                            setDragGroup(null);
                          }}
                        />
                      );
                    })}
                    {r.groups.length === 0 && (
                      <div className="fs12 text3">尚未設定群組，所有人皆依「其他人員」分攤。</div>
                    )}
                  </div>
                ) : (
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
                )}

                <div
                  className="flex items-center between gap-10 mt-14"
                  style={{ paddingTop: 12, borderTop: "1px solid var(--ln-control)" }}
                >
                  <span className="grow fs12 text2">其他人員</span>
                  {isEditing ? (
                    <span className="flex items-center gap-8" style={{ flex: "none" }}>
                      <div className="combo">
                        <button
                          type="button"
                          className="combo-trigger-pill"
                          onClick={() => setEffPick(`rest:${i}`)}
                        >
                          {restMode(r) === "exclude" ? "不計入" : "權重"}
                        </button>
                        {effPick === `rest:${i}` && (
                          <>
                            <div className="picker-backdrop" onClick={closePickers} />
                            <div className="picker-panel">
                              <button
                                type="button"
                                className={`picker-row${restMode(r) === "weight" ? " is-sel" : ""}`}
                                onClick={() => {
                                  updateRule(i, { rest: { mode: "weight", wt: r.rest?.wt || "1" } });
                                  setEffPick(null);
                                }}
                              >
                                <span>× 權重</span>
                              </button>
                              <button
                                type="button"
                                className={`picker-row${restMode(r) === "exclude" ? " is-sel" : ""}`}
                                onClick={() => {
                                  updateRule(i, { rest: { mode: "exclude", wt: "" } });
                                  setEffPick(null);
                                }}
                              >
                                <span>— 不計入</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                      {restMode(r) === "weight" && (
                        <input
                          className={`input input--sm${validWeight(r.rest?.wt) ? "" : " input--err"}`}
                          style={{ width: 70, textAlign: "right" }}
                          value={r.rest?.wt ?? ""}
                          placeholder="1"
                          onChange={(e) => updateRule(i, { rest: { mode: "weight", wt: e.target.value } })}
                        />
                      )}
                    </span>
                  ) : (
                    <span className="fs14 fw500">{calcRestLabel(r)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
