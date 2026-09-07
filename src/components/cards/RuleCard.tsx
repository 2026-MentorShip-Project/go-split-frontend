"use client";

import { EditIcon, TrashIcon, CheckIcon, XIcon } from "@/components/icons";
import Chip from "@/components/ui/Chip";

interface RuleLine {
  chips: { label: string }[];
  effect: string;
  count: string;
}

interface RuleCardProps {
  tagLabel: string;
  tagUsed: boolean;
  restLabel: string;
  lines: RuleLine[];
  alertOutline: string;
  editing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  editContent?: React.ReactNode;
  onCloseEdit?: () => void;
  onSaveEdit?: () => void;
}

export default function RuleCard({
  tagLabel,
  tagUsed,
  restLabel,
  lines,
  alertOutline,
  editing,
  onEdit,
  onDelete,
  editContent,
  onCloseEdit,
  onSaveEdit,
}: RuleCardProps) {
  if (editing) {
    return (
      <div className="card" style={alertOutline ? { borderColor: alertOutline } : undefined}>
        <div className="card-pad">
          <div className="flex items-center between">
            <div className="flex items-center gap-8">
              <Chip label={tagLabel} kind="item" selected={tagUsed} />
              <span className="pill-neutral">{restLabel}</span>
            </div>
            <div className="flex items-center gap-6">
              <button type="button" className="icon-btn-sm" onClick={onCloseEdit}>
                <XIcon size={16} />
              </button>
              <button type="button" className="icon-btn-sm icon-btn-sm--fill" onClick={onSaveEdit}>
                <CheckIcon size={16} />
              </button>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>{editContent}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={alertOutline ? { borderColor: alertOutline } : undefined}>
      <div className="card-pad">
        <div className="flex items-center between">
          <div className="flex items-center gap-8">
            <Chip label={tagLabel} kind="item" selected={tagUsed} />
            <span className="pill-neutral">{restLabel}</span>
          </div>
          <div className="flex items-center gap-6">
            <button type="button" className="icon-btn-sm" onClick={onEdit}>
              <EditIcon size={16} />
            </button>
            <button type="button" className="icon-btn-sm" onClick={onDelete} style={{ color: "var(--danger)" }}>
              <TrashIcon size={16} />
            </button>
          </div>
        </div>

        <div className="flex-col gap-6" style={{ marginTop: 10 }}>
          {lines.map((line, i) => (
            <div key={i} className="flex items-center gap-8" style={{ padding: "4px 0" }}>
              <div className="flex wrap gap-4 grow">
                {line.chips.map((c, j) => (
                  <Chip key={j} label={c.label} kind="cond" />
                ))}
              </div>
              <span className="fs12 text3">{line.count}</span>
              <span className="pill-neutral">{line.effect}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
