import { Pencil } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Spinner } from "./spinner";

interface EditableNameProps {
  content: string;
  onChange: (newName: string) => void;
  isLoading?: boolean;
}

export const EditableName: React.FC<EditableNameProps> = ({
  content,
  onChange,
  isLoading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(content);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setValue(content);
  }, [content]);

  const handleBlur = () => {
    setIsEditing(false);
    if (value !== content) {
      onChange(value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleBlur();
    } else if (event.key === "Escape") {
      setValue(content);
      setIsEditing(false);
    }
  };

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="relative flex items-center gap-1 cursor-pointer group"
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full box-border"
        />
      ) : (
        <span>{content}</span>
      )}
      {!isEditing &&
        (isLoading ? (
          <Spinner className="w-3 h-3" />
        ) : (
          <Pencil className="opacity-0 group-hover:opacity-100 w-3 h-3" />
        ))}
    </div>
  );
};
