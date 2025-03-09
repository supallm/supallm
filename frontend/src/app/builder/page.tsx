"use client";

import { Button } from "@/components/ui/button";
import { createFlowUsecase } from "@/core/usecases";
import { FlowBuilderRoute } from "@/routes";
import { useRouter } from "next/navigation";

export default function CreateFlowPage() {
  const router = useRouter();

  const createFlow = async () => {
    const { id } = await createFlowUsecase.execute({
      name: "My new flow",
      projectId: "123",
    });

    console.log(id);
    router.push(FlowBuilderRoute.path(id));
  };

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <Button onClick={createFlow}>Create Flow</Button>
    </div>
  );
}
