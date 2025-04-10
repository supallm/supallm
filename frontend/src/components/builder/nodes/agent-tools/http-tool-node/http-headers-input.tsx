import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckIcon } from "lucide-react";
import { FC, useState } from "react";

export const HttpHeadersInput: FC<{
  initialHeaders: {
    key: string;
    value: string;
  }[];
  onChange: (headers: { key: string; value: string }[]) => void;
}> = ({ initialHeaders, onChange }) => {
  const [headers, setHeaders] =
    useState<{ key: string; value: string }[]>(initialHeaders);

  const [newHeader, setNewHeader] = useState<{
    key: string;
    value: string;
  }>({
    key: "",
    value: "",
  });

  const setHeaderKey = (key: string) => {
    setNewHeader({ ...newHeader, key });
  };

  const setHeaderValue = (value: string) => {
    setNewHeader({ ...newHeader, value });
  };

  const onSubmit = () => {
    if (newHeader.key && newHeader.value) {
      setHeaders([...headers, newHeader]);
      setNewHeader({ key: "", value: "" });
    }

    onChange(headers);
  };

  return (
    <div className="space-y-1">
      <div className="flex flex-col gap-1">
        {headers.map((header) => {
          return (
            <div key={header.key} className="flex gap-1">
              <span className="text-xs font-medium">{header.key}</span>
              <span className="text-sm">{header.value}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-1">
        <Input
          inputSize={"sm"}
          placeholder="Authorization"
          value={newHeader.key}
          onChange={(e) => setHeaderKey(e.target.value)}
        />
        <Input
          inputSize={"sm"}
          placeholder="Bearer ..."
          value={newHeader.value}
          onChange={(e) => setHeaderValue(e.target.value)}
        />
      </div>
      <Button
        size="xs"
        className="w-full"
        disabled={!newHeader.key.length || !newHeader.value.length}
        variant="outline"
        startContent={<CheckIcon />}
        onClick={onSubmit}
      >
        Add
      </Button>
    </div>
  );
};
