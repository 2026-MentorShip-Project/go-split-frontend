"use client";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="app-root" style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <div className="app-body">
        <div className="app-scroll">{children}</div>
      </div>
    </div>
  );
}
