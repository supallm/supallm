"use client";

import { useAuth } from "@/context/auth/use-auth";
import { useEffect } from "react";

export function useAppConfig() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }
  }, [user, isLoading]);

  return { user, isLoading };
}
