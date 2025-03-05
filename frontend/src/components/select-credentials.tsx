"use client";

import { ProviderType } from "@/core/entities/credential";
import { useAppConfigStore } from "@/core/store/app-config";
import { useCredentialStore } from "@/core/store/credentials";
import { useListCredentials } from "@/hooks/use-list-credentials";
import { CredentialsRoute } from "@/routes";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { Button } from "./ui/button";
import { FormControl } from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Skeleton } from "./ui/skeleton";

export const SelectCredentials: FC<{
  onValueChange: (value: string) => void;
  defaultValue: string;
  providerType: ProviderType;
}> = ({ onValueChange, defaultValue, providerType }) => {
  const router = useRouter();
  const { currentProject } = useAppConfigStore();

  if (!currentProject) {
    throw new Error(
      "Unexpected error: no project id. Make sure to use this component in the ProjectOnly scope.",
    );
  }

  const { isLoading } = useListCredentials(currentProject.id);
  const { list: items } = useCredentialStore();

  const filteredItems = items.filter(
    (item) => item.providerType === providerType,
  );

  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <FormControl className="w-full">
        <SelectTrigger>
          <SelectValue placeholder="Select the credentials to use" />
        </SelectTrigger>
      </FormControl>
      <SelectContent className="w-full">
        {isLoading && (
          <div className="space-y-1 p-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}
        {!isLoading && !filteredItems?.length && (
          <div className="p-6 text-muted-foreground text-sm flex flex-col items-center gap-2 justify-center">
            No credentials found for this provider.{" "}
            <Button
              onClick={() => {
                router.push(CredentialsRoute.path());
              }}
              size="xs"
              variant="outline"
              startContent={<PlusIcon className="h-2 w-2" />}
            >
              Create credentials
            </Button>
          </div>
        )}
        {!isLoading && !!filteredItems?.length && (
          <>
            {items.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  );
};
