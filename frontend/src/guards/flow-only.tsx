"use client";

import { GlobalLoading } from "@/components/global-loading";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentProjectOrThrow } from "@/hooks/use-current-project-or-throw";
import { useFlow } from "@/hooks/use-flow";
import { useParams, useRouter } from "next/navigation";
import { FC, PropsWithChildren, useEffect } from "react";

const PageSkeleton = () => {
  return (
    <div className="h-screen w-screen">
      <div className="fixed top-[60px] left-4 flex flex-row gap-2 items-center">
        <Skeleton className="h-[40px] w-[100px] w-fill rounded-md" />
        <Skeleton className="h-[20px] w-[200px] w-fill rounded-md" />
      </div>

      <GlobalLoading />
    </div>
  );
};

export const FlowOnly: FC<PropsWithChildren> = ({ children }) => {
  const { id: flowId } = useParams<{ id: string }>();
  const { id: projectId } = useCurrentProjectOrThrow();

  const { result, isLoading } = useFlow(projectId, flowId);
  const router = useRouter();

  useEffect(() => {
    if (!result && !isLoading) {
      router.push("/builder/");
    }
  }, [result, isLoading]);

  if (!result && !isLoading) {
    return <PageSkeleton />;
  }

  if (isLoading) {
    return <PageSkeleton />;
  }

  return <>{children}</>;
};
