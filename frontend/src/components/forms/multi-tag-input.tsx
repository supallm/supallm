import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const deduplicateTags = (tags: string[]) => {
  return tags.filter((tag, index, self) => self.indexOf(tag) === index);
};

export const MultiTagInput: FC<{
  tags: string[];
  formatInFunction?: (tag: string) => string;
  formatOutFunction?: (tag: string) => string;
  formatOnEnterFunction?: (tag: string) => string;
  onChange: (tags: string[]) => void;
  placeholder: string;
  maxTags?: number;
}> = ({
  tags: initialTags,
  formatInFunction,
  formatOutFunction,
  formatOnEnterFunction,
  onChange,
  placeholder,
  maxTags,
}) => {
  const [inputValue, setInputValue] = useState<string>("");

  const formatIn = useCallback(
    (tag: string) => formatInFunction?.(tag) ?? tag,
    [formatInFunction],
  );

  const formatOut = useCallback(
    (tag: string) => formatOutFunction?.(tag) ?? tag,
    [formatOutFunction],
  );

  const formatOnEnter = useCallback(
    (tag: string) => formatOnEnterFunction?.(tag) ?? tag,
    [formatOnEnterFunction],
  );

  const [tags, setTags] = useState<string[]>(initialTags.map(formatIn));

  useEffect(() => {
    onChange(tags.map(formatOut));
  }, [tags]);

  return (
    <div>
      <Input
        disabled={maxTags !== undefined && tags.length >= maxTags}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setTags(deduplicateTags([...tags, formatOnEnter(inputValue)]));
            setInputValue("");
          }
        }}
      />

      <div className={cn("flex flex-wrap gap-2", tags.length > 0 && "mt-3")}>
        {tags.map((tag) => (
          <div
            key={tag}
            className="bg-gray-100 px-2 py-0.5 rounded-sm text-sm text-gray-600 flex items-center gap-2"
          >
            <span>{tag}</span>
            <Button
              type="button"
              className="p-0 w-3 h-3"
              variant="icon"
              size="icon"
              onClick={() => {
                setTags(tags.filter((t) => t !== tag));
              }}
            >
              <X className="text-sm" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
