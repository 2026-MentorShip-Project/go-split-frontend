"use client";

import { StarIcon } from "@/components/icons";
import Chip from "@/components/ui/Chip";

interface TagPickerProps {
  tags: string[];
  selectedTag: string | null;
  open: boolean;
  query: string;
  onOpen: () => void;
  onClose: () => void;
  onQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (tag: string) => void;
  onClear: () => void;
  itemTags: string[];
}

export default function TagPicker({
  tags,
  selectedTag,
  open,
  query,
  onOpen,
  onClose,
  onQueryChange,
  onSelect,
  onClear,
  itemTags,
}: TagPickerProps) {
  const filtered = tags.filter(
    (t) => !query || t.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="combo" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <StarIcon size={18} />

      {selectedTag ? (
        <Chip
          label={selectedTag}
          kind="item"
          selected
          onClick={onClear}
          suffix=" ✕"
        />
      ) : (
        <button
          type="button"
          className="combo-trigger-pill"
          onClick={onOpen}
          style={{ fontSize: 13, padding: "5px 12px" }}
        >
          標籤
        </button>
      )}

      {open && (
        <>
          <div className="picker-backdrop" onClick={onClose} />
          <div className="picker-panel" style={{ top: "calc(100% + 4px)", minWidth: 180 }}>
            <input
              className="input input--sm"
              placeholder="搜尋標籤…"
              value={query}
              onChange={onQueryChange}
              autoFocus
            />
            {filtered.length === 0 ? (
              <div className="picker-empty">無符合標籤</div>
            ) : (
              filtered.map((t) => {
                const used = itemTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    className={`picker-row${used ? " is-used" : ""}`}
                    onClick={() => !used && onSelect(t)}
                  >
                    {t}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
