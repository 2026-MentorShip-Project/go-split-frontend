"use client";

interface SegmentedTabsProps {
  tabs: { label: string; active: boolean; onClick: () => void }[];
}

export default function SegmentedTabs({ tabs }: SegmentedTabsProps) {
  return (
    <div className="segmented">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          className={`segmented-tab${tab.active ? " is-active" : ""}`}
          onClick={tab.onClick}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
