"use client";

import { usePopup } from "../hooks";
import { PopupForm } from "./popup-form";

export function EditPopupContent({ id }: { id: string }) {
  const { data: popup, isLoading } = usePopup(id);

  if (isLoading || !popup) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  return <PopupForm popup={popup} />;
}
