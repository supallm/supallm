import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TrashIcon } from "lucide-react";
import { FC, PropsWithChildren, useState } from "react";

export const HttpToolAdvancedSettingsDialog: FC<
  PropsWithChildren<{
    headers: {
      key: string;
      value: string;
    }[];
    onChange: (
      headers: {
        key: string;
        value: string;
      }[],
    ) => void;
  }>
> = ({ children, headers: initialHeaders, onChange }) => {
  const [open, setOpen] = useState(false);

  const [headers, setHeaders] = useState(initialHeaders ?? []);

  const [newHeader, setNewHeader] = useState({
    key: "",
    value: "",
  });

  const setHeaderKey = (key: string) => {
    setNewHeader({ ...newHeader, key });
  };

  const setHeaderValue = (value: string) => {
    setNewHeader({ ...newHeader, value });
  };

  const onAddHeader = () => {
    if (newHeader.key?.length && newHeader.value?.length) {
      setHeaders([...headers, newHeader]);
      setNewHeader({ key: "", value: "" });
    }
  };

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setHeaders(initialHeaders);
    }
    setOpen(open);
  };

  async function handleCancel() {
    setHeaders(initialHeaders);
    setOpen(false);
  }

  async function onSave() {
    onChange(headers);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-[900px]">
        <SheetHeader className="border-b">
          <SheetTitle>Advanced settings</SheetTitle>
          <SheetDescription>
            You can add custom headers to the HTTP request. This is useful for
            setting the Authorization header, for example.
          </SheetDescription>
        </SheetHeader>
        <div className="p-4 overflow-y-auto space-y-4">
          <div>
            <div className="flex flex-col gap-2">
              {headers.map((header) => (
                <div key={header.key} className="flex gap-2 items-center">
                  <Input
                    placeholder="Authorization"
                    value={header.key}
                    disabled
                  />
                  <Input
                    placeholder="Bearer ..."
                    value={header.value}
                    disabled
                  />
                  <Button
                    onClick={() => {
                      setHeaders(headers.filter((h) => h.key !== header.key));
                    }}
                    variant="outline"
                    type="button"
                    className="h-full shrink-0"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <div className="flex gap-2 w-full">
                <Input
                  className="w-full"
                  placeholder="Authorization"
                  value={newHeader.key}
                  onChange={(e) => setHeaderKey(e.target.value)}
                />
                <Input
                  className="w-full"
                  placeholder="Bearer ..."
                  value={newHeader.value}
                  onChange={(e) => setHeaderValue(e.target.value)}
                />
                <Button
                  disabled={!newHeader.key?.length || !newHeader.value?.length}
                  onClick={onAddHeader}
                  variant={"outline"}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
        <SheetFooter>
          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel} variant={"outline"}>
              Cancel
            </Button>
            <Button onClick={onSave}>Save</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
