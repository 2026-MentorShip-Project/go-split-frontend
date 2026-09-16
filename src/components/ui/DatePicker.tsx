"use client";

interface DateTimePickerProps {
  dateValue: string;
  combinedValue: string;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCombinedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearDate: () => void;
}

export default function DatePicker({
  dateValue,
  onDateChange,
  onClearDate,
}: DateTimePickerProps) {
  return (
    <div>
      <input
        type="date"
        className="input"
        value={dateValue}
        onChange={onDateChange}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        {(dateValue) && (
          <button className="btn-link" onClick={onClearDate}>清除日期</button>
        )}
      </div>
    </div>
  );
}
