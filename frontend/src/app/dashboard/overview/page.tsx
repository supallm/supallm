"use client";

import { CopiableKey } from "@/components/copiable-key";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { SdkCodeExample } from "@/components/sdk-code-example";
import { Spacer } from "@/components/spacer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppConfigStore } from "@/core/store/app-config";
import { createFlowUsecase } from "@/core/usecases";
import { useCurrentProjectOrThrow } from "@/hooks/use-current-project-or-throw";
import { useListFlows } from "@/hooks/use-list-flows";
import { FlowBuilderRoute } from "@/routes";
import { BrainCircuit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SectionSkeleton = () => {
  return (
    <div className="">
      <div className="space-y-4 w-full flex flex-col grow">
        <Skeleton className="h-[125px] w-fill rounded-xl" />
        <Skeleton className="h-[125px] w-fill rounded-xl" />
      </div>
    </div>
  );
};

const OnboardingSection = () => {
  const router = useRouter();

  const { id: projectId } = useCurrentProjectOrThrow();

  const { result: flows, isLoading } = useListFlows(projectId);

  const [isCreating, setIsCreating] = useState(false);

  const hasFlows = flows.length > 0;

  if (isLoading) {
    return <SectionSkeleton />;
  }

  if (hasFlows) {
    return null;
  }

  const handleCreateFlow = async () => {
    try {
      setIsCreating(true);
      const { id } = await createFlowUsecase.execute({
        projectId,
      });

      router.push(FlowBuilderRoute.path(id));
    } catch {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-5">
      <h1 className="text-lg pb-3 font-medium">Getting Started</h1>
      <Card className="bg-gradient-to-r from-slate-50 via-white to-green-50">
        <CardContent className="space-y-4">
          <div>
            <h1 className="text-lg font-medium flex items-center">
              <Badge variant={"outline"} className="mr-2">
                Step 1
              </Badge>
              Create an AI Flow
            </h1>
            <p className="text-md text-muted-foreground">
              Start by creating an AI Flow. Then you can call it directly using
              our frontend or backend SDK.
            </p>
          </div>
          <div className="space-x-4">
            <Button
              onClick={handleCreateFlow}
              variant="outline"
              size={"sm"}
              className="cursor-pointer"
              startContent={<BrainCircuit className="w-4 h-4" />}
              isLoading={isCreating}
            >
              Create an AI Flow
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProjectSection = () => {
  const currentProject = useCurrentProjectOrThrow();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  }, []);

  if (isLoading) {
    return <SectionSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4 mt-5">
      <h1 className="text-lg pb-3 font-medium">Connecting to your project</h1>

      <Card className="bg-gradient-to-r from-slate-50 via-white to-green-50 pt-0">
        <div className="text-lg font-medium flex flex-col my-0 py-0 border-b py-5 px-6 space-y-2">
          <h1>Project API</h1>
          <div>
            <p className="text-sm text-muted-foreground">
              Your flows are secured behind an API gateway which requires an API
              Key for every request.
            </p>
            <p className="text-sm text-muted-foreground">
              You can use the keys below in the Supallm client libraries.
            </p>
          </div>
        </div>
        <div className="divide-y">
          <div className="py-4 px-6 flex justify-between gap-4">
            <div>
              <span className="text-lg font-medium flex items-center mt-0">
                Project ID
              </span>
              <p className="text-muted-foreground text-sm">
                This id is used to identify your project in Supallm. It is safe
                to share it.
              </p>
            </div>
            <div className="shrink-0">
              <CopiableKey
                className="w-[500px]"
                width="full"
                size="md"
                value={currentProject.id}
              />
            </div>
          </div>
          <div className="py-4 px-6 flex justify-between gap-4">
            <div>
              <span className="text-lg font-medium flex items-center mt-0">
                Secret Key
              </span>
              <p className="text-muted-foreground text-sm">
                This key allows access to your flows.{" "}
                <strong>Never share it</strong> publicly. If leaked, generate a
                new secret key immediately.
              </p>
            </div>
            <div className="shrink-0">
              <CopiableKey
                isSecret
                className="w-[500px]"
                width="full"
                size="md"
                value={currentProject.secretKey}
              />
            </div>
          </div>
          <div className="py-4 px-6 flex flex-col justify-between gap-4">
            <div>
              <h1 className="text-lg font-medium flex items-center">
                Use our SDK to call your flows
              </h1>
            </div>
            <div className="space-y-4">
              <SdkCodeExample
                projectId={currentProject.id}
                secretKey={currentProject.secretKey}
                flowId={"your-flow-id"}
                inputs={[
                  {
                    label: "prompt",
                    value: "What is the capital of France?",
                  },
                ]}
                showInitSdk={true}
              ></SdkCodeExample>
            </div>
          </div>
        </div>
      </Card>
      <Spacer direction="vertical" size="sm" />
    </div>
  );
};

const OverviewPage = () => {
  const { currentProject } = useAppConfigStore();

  if (!currentProject) {
    throw new Error("Project must be defined");
  }

  const router = useRouter();

  return (
    <div className="pb-15">
      <PageHeader title={currentProject.name} noBorder />
      <PageContainer>
        <div className="flex flex-col gap-4">
          <OnboardingSection />
          <ProjectSection />
        </div>
      </PageContainer>
    </div>
  );
};

export default OverviewPage;
