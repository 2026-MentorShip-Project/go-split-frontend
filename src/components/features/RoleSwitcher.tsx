"use client";

interface RoleSwitcherProps {
  rows: {
    role: string;
    opts: {
      label: string;
      sel: boolean;
      pick: () => void;
    }[];
  }[];
  onReset: () => void;
}

export default function RoleSwitcher({ rows, onReset }: RoleSwitcherProps) {
  return (
    <div className="roleswitch">
      <div className="roleswitch-head">
        <span className="roleswitch-title">角色切換（原型測試用）</span>
        <button type="button" className="pill-dashed" onClick={onReset}>
          重置
        </button>
      </div>

      <div className="roleswitch-rows">
        {rows.map((row) => (
          <div key={row.role} className="roleswitch-row">
            <span className="roleswitch-label">{row.role}</span>
            <div className="roleswitch-opts">
              {row.opts.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  className={`pill-toggle${opt.sel ? " is-sel" : ""}`}
                  onClick={opt.pick}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
