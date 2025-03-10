"use client";

import { ConfigureAuthProviderDialog } from "@/components/auth-providers/configure-auth-provider-dialog";
import { CopiableKey } from "@/components/copiable-key";
import { EmptyState } from "@/components/empty-state";
import { Supabase } from "@/components/logos/supabase";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { Spacer } from "@/components/spacer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppConfigStore } from "@/core/store/app-config";
import { useState } from "react";

const Page = () => {
  const { currentProject } = useAppConfigStore();
  const [openProviderDialog, setOpenProviderDialog] = useState(false);

  if (!currentProject) {
    throw new Error("Project must be defined");
  }

  return (
    <div>
      <PageHeader title="Authentication" description="" />
      <PageContainer>
        <h1 className="text-lg pb-3 font-medium mt-10">Frontend SDK</h1>
        <p className="text-muted-foreground max-w-lg">
          Supallm allows you to use your flows directly from your frontend
          securely. To do so, you must first configure your authentication
          provider.
        </p>

        <Spacer direction="vertical" size="sm" />

        <ConfigureAuthProviderDialog
          isOpen={openProviderDialog}
          onOpenChange={setOpenProviderDialog}
        />

        <EmptyState
          title="No authentication provider configured"
          description="You must first configure your authentication provider before you can use the frontend SDK."
        >
          <Button onClick={() => setOpenProviderDialog(true)}>Configure</Button>
        </EmptyState>

        <div className="flex flex-col gap-4 mt-5">
          <Card className="bg-gradient-to-r from-slate-50 via-white to-green-50 py-0 space-y-0 gap-0">
            <div className="text-lg font-medium flex flex-col my-0 border-b py-5 px-6 space-y-2">
              <div className="flex items-center justify-start gap-3">
                <Supabase className="w-6 h-6" />
                <h1>Supabase Connected</h1>
              </div>
              <div>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Your flows are secured behind an API gateway which will verify
                  the Authorization bearer is a valid JWT token issued by your
                  Supabase project.
                </p>
              </div>
            </div>
            <div className="divide-y">
              <div className="px-6 flex justify-between items-center py-6">
                <div>
                  <span className="text-lg font-medium flex items-center mt-0">
                    Project URL
                  </span>
                  <p className="text-muted-foreground text-sm">
                    This is the URL of your supabase project.
                  </p>
                </div>
                <div className="shrink-0">
                  <CopiableKey
                    className="w-[500px]"
                    width="full"
                    size="md"
                    value={`https://vfqquxnvjuqmirqkgguv.supabase.co`}
                  />
                </div>
              </div>
              <div className="py-4 px-6 flex justify-between gap-4 py-6">
                <div>
                  <span className="text-lg font-medium flex items-center mt-0">
                    JWT Secret
                  </span>
                  <p className="text-muted-foreground text-sm">
                    This is the JWT secret of your supabase project, do not
                    share this with anyone.
                  </p>
                </div>
                <div className="shrink-0">
                  <CopiableKey
                    isSecret
                    className="w-[500px]"
                    width="full"
                    size="md"
                    value={`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJanVxbWlycWtnZ3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODk5MzUsImV4cCI6MjA1NjU2NTkzNX0.A42ENSTqP7JNjSri4YP0JKcPk1NIkyBWwI1DKlJ0VxA`}
                  />
                </div>
              </div>
            </div>
          </Card>
          <Spacer direction="vertical" size="sm" />
        </div>
        <Spacer direction="vertical" size="md" />
      </PageContainer>
    </div>
  );
};

export default Page;
