/**
 * The API saves a line nobody shares yet and blocks settlement until it is
 * fixed; custom amounts that don't add up are rejected on save.
 */
const SPLIT_ISSUE_TEXT: Record<string, string> = {
  "no-participant": "目前沒有人分攤這筆，結算前需調整標籤或人員條件",
  "custom-mismatch": "指定金額加總與品項金額不符",
  "custom-overflow": "指定金額超過品項金額",
};

export function splitIssueText(validity: string): string {
  return SPLIT_ISSUE_TEXT[validity] ?? "這筆無法分攤";
}

export function blocksSave(validity: string | null | undefined): boolean {
  return Boolean(validity) && validity !== "no-participant";
}

export function splitIssueColor(validity: string): string {
  return blocksSave(validity) ? "var(--danger)" : "var(--tag-item-fg)";
}
