"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function CompletarControlPage({ params }: { params: Promise<{ controlId: string }> }) {
  const { controlId } = use(params);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/controles/${controlId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    }).then(() => router.push("/controles"));
  }, [controlId, router]);

  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-sm text-gray-500">Completando control...</p>
    </div>
  );
}
