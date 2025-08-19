import React from "react";

export const Card: React.FC<{ title?: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="card">
    {title && <h2 style={{ marginTop: 0 }}>{title}</h2>}
    {children}
  </div>
);