"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function SettledRedirect() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    router.replace(`/events/${params.eventId}`);
  }, [router, params.eventId]);

  return <div className="page-shell">載入中…</div>;
}
