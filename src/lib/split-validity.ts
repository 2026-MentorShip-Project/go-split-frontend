/**
 * A line nobody shares goes to its payer. Only custom amounts that don't add
 * up remain invalid; the API rejects them on save.
 */
const SPLIT_ISSUE_TEXT: Record<string, string> = {
  "custom-mismatch": "指定金額加總與品項金額不符",
  "custom-overflow": "指定金額超過品項金額",
};

export const PAYER_ABSORBS_NOTE = "沒有人符合分攤條件，由付款人全額負擔";

export function splitIssueText(validity: string): string {
  return SPLIT_ISSUE_TEXT[validity] ?? "這筆無法分攤";
}
