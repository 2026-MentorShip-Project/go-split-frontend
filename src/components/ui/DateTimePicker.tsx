"use client";

interface DateTimePickerProps {
  hasTime: boolean;
  dateValue: string;
  timeValue: string;
  combinedValue: string;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCombinedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddTime: () => void;
  onClearTime: () => void;
  onClearDate: () => void;
}

export default function DateTimePicker({
  hasTime,
  dateValue,
  timeValue,
  combinedValue,
  onDateChange,
  onCombinedChange,
  onAddTime,
  onClearTime,
  onClearDate,
}: DateTimePickerProps) {
  return (
    <div>
      {hasTime ? (
        <input
          type="datetime-local"
          className="input"
          value={combinedValue}
          onChange={onCombinedChange}
        />
      ) : (
        <input
          type="date"
          className="input"
          value={dateValue}
          onChange={onDateChange}
        />
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        {!hasTime && dateValue && (
          <button className="btn-link" onClick={onAddTime}>加入時間</button>
        )}
        {hasTime && (
          <button className="btn-link" onClick={onClearTime}>移除時間</button>
        )}
        {(dateValue || combinedValue) && (
          <button className="btn-link" onClick={onClearDate}>清除日期</button>
        )}
      </div>
    </div>
  );
}
