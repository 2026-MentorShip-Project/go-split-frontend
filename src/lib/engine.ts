import {
  initEngine,
  splitDetail,
  type Detail as EngineDetail,
  type Group as EngineGroup,
  type Member as EngineMember,
  type Rule as EngineRule,
  type SplitResult,
} from '@go-split/engine';
import type { ItemDetail, Member, Rule, RuleGroup } from './types';
import { num } from './formatters';

/** Copied into public/ by scripts/sync-engine.mjs. */
const WASM_URL = '/engine.wasm';

let ready = false;

export function initSplitEngine(): Promise<void> {
  return initEngine({ wasmURL: WASM_URL }).then(() => {
    ready = true;
  });
}

export function splitEngineReady(): boolean {
  return ready;
}

/** Blank and malformed weights fall through to the engine's own default of 1. */
function toEngineWeight(wt: string | undefined): number | undefined {
  if (wt === undefined || wt.trim() === '') return undefined;
  const parsed = Number(wt);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toEngineGroup(group: RuleGroup): EngineGroup {
  const conds = group.conds ?? [];
  return group.mode === 'exclude'
    ? { conds, mode: 'exclude' }
    : { conds, mode: 'weight', weight: toEngineWeight(group.wt) };
}

export function toEngineRules(rules: Rule[]): EngineRule[] {
  return rules
    .filter((rule) => rule.tag)
    .map((rule) => ({
      item_tag: rule.tag,
      groups: (rule.groups ?? []).map(toEngineGroup),
      rest: rule.rest ? toEngineGroup({ conds: [], ...rule.rest }) : null,
    }));
}

/**
 * Engine IDs are positional, so any UI id format works and the array order that
 * decides remainder recipients is carried through as split_order.
 */
export function toEngineMembers(members: Member[]): EngineMember[] {
  return members.map((member, i) => ({ id: i + 1, cond_tags: member.tags ?? [] }));
}

function engineIdsByMember(members: Member[]): Map<string, number> {
  return new Map(members.map((member, i) => [member.id, i + 1]));
}

export function membersByEngineId(members: Member[]): Map<number, Member> {
  return new Map(members.map((member, i) => [i + 1, member]));
}

/**
 * A detail carries several UI tags but the engine keys a rule off one. Prefer the
 * first tag a rule exists for, matching how the previous lookup picked a rule.
 */
function engineItemTag(tags: string[] | undefined, rules: Rule[]): string {
  const list = tags ?? [];
  return list.find((tag) => rules.some((rule) => rule.tag === tag)) ?? list[0] ?? '';
}

function toEngineDetail(
  detail: ItemDetail,
  rules: Rule[],
  engineIds: Map<string, number>,
): EngineDetail {
  const custom: Record<string, number> = {};
  for (const [memberId, value] of Object.entries(detail.custom ?? {})) {
    const engineId = engineIds.get(memberId);
    if (engineId === undefined) continue;
    const amount = typeof value === 'number' ? value : num(value);
    if (Number.isFinite(amount)) custom[String(engineId)] = amount;
  }

  const manual = detail.ids
    ? detail.ids
        .map((memberId) => engineIds.get(memberId))
        .filter((id): id is number => id !== undefined)
    : null;

  return {
    amount: typeof detail.amount === 'number' ? detail.amount : num(detail.amount),
    item_tag: engineItemTag(detail.tags, rules),
    manual_member_ids: manual,
    custom_amounts: custom,
  };
}

/** Throws until initSplitEngine() resolves; gate callers on useSplitEngine(). */
export function splitOneDetail(
  detail: ItemDetail,
  members: Member[],
  rules: Rule[],
): SplitResult {
  const engineIds = engineIdsByMember(members);
  return splitDetail({
    detail: toEngineDetail(detail, rules, engineIds),
    members: toEngineMembers(members),
    rules: toEngineRules(rules),
    split_order: members.map((_, i) => i + 1),
  });
}
