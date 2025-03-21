"use client";

import Logo from "@/components/logo";
import { useAuth } from "@/context/auth/use-auth";
import { useEffect } from "react";

const LogoutPage = () => {
  const { logout } = useAuth();

  useEffect(() => {
    setTimeout(() => {
      logout();
    }, 1000);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center mb-30">
        <Logo width={30} iconOnly={true} className="animate-pulse" />
        <h1 className="text-2xl font-bold mt-3">Goodbye!</h1>
        <p className="text-sm text-muted-foreground mt-1">
          We are logging you out...
        </p>
      </div>
    </div>
  );
};

export default LogoutPage;
