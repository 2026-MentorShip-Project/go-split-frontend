"use client";

interface ToastProps {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  return (
    <div className="toast" onClick={onClose}>
      {message}
    </div>
  );
}
