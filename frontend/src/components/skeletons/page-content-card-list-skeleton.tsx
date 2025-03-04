import { PlusIcon, Space } from "lucide-react";
import { PageContainer } from "../page-container";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Spacer } from "../spacer";

export const PageContentCardListSkeleton = () => {
  return (
    <div className="">
      <PageContainer>
        <div className="flex justify-end">
          <Button disabled startContent={<PlusIcon className="w-3 h-3" />}>
            Add LLM provider
          </Button>
        </div>
        <Spacer />
        <div className="space-y-4 w-full flex flex-col grow">
          <Skeleton className="h-[125px] w-fill rounded-xl" />
          <Skeleton className="h-[125px] w-fill rounded-xl" />
        </div>
      </PageContainer>
    </div>
  );
};
