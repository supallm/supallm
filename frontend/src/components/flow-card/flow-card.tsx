import { deleteFlowUsecase } from "@/core/usecases"; // Assuming you have a delete use case for flows
import { hookifyFunction } from "@/hooks/hookify-function";
import { FlowBuilderRoute } from "@/routes"; // Import FlowBuilderRoute
import { Cog, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation"; // Import useRouter
import { FC } from "react";
import { ConfirmDangerDialog } from "../confirm-danger-dialog";
import { Button } from "../ui/button";
import { Card, CardFooter, CardHeader } from "../ui/card";

export type FlowCardProps = {
  flow: {
    id: string;
    name: string;
  };
};

export const FlowCard: FC<FlowCardProps> = ({ flow }) => {
  const router = useRouter(); // Initialize useRouter

  const { execute: deleteFlow, isLoading: deleteFlowLoading } = hookifyFunction(
    deleteFlowUsecase.execute.bind(deleteFlowUsecase),
  );

  const handleDelete = async () => {
    await deleteFlow(flow.id);
  };

  const handleEdit = (e: React.MouseEvent<HTMLDivElement>) => {
    router.push(FlowBuilderRoute.path(flow.id)); // Navigate to the flow editing route
  };

  return (
    <Card className="bg-gradient-to-bl from-green-50 via-white to-gray-50 hover:scale-101 transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">{flow.name}</h2>
        </div>
      </CardHeader>
      <CardFooter>
        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-row gap-2 items-center">
            <Button size="xs" variant="outline" onClick={handleEdit}>
              <Cog className="text-muted-foreground w-4 h-4" /> Edit
            </Button>

            <ConfirmDangerDialog
              title="Are you sure?"
              description="This action will remove the flow and all related data."
              onConfirm={handleDelete}
              confirmationText="DELETE"
            >
              <Button size="xs" variant="outline" isLoading={deleteFlowLoading}>
                <Trash2 className="text-muted-foreground w-4 h-4" />
              </Button>
            </ConfirmDangerDialog>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
