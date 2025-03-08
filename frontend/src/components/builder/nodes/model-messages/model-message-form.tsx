import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { FC, useState } from "react";

export const MessageRoles = ["user", "assistant"] as const;

export type MessageRole = (typeof MessageRoles)[number];

export type Message = {
  role: MessageRole;
  content: string;
};

export type ModelMessageFormProps = {
  role: MessageRole;
  content: string;
  onRemove: () => void;
};

const ModelMessageForm: FC<ModelMessageFormProps> = (props) => {
  const [role, setRole] = useState<MessageRole>(props.role);
  const [content, setContent] = useState(props.content);

  return (
    <div className="flex flex-col gap-2 border p-5 rounded-md">
      <Select
        onValueChange={(value) => setRole(value as MessageRole)}
        defaultValue={role}
      >
        <FormControl className="w-full">
          <SelectTrigger>
            <SelectValue placeholder="Select the role" />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="w-full">
          {MessageRoles.map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter message content"
      />
      <Button
        variant="outline"
        size="xs"
        type="button"
        startContent={<Trash2 size={10} />}
        onClick={props.onRemove}
      >
        Remove
      </Button>
    </div>
  );
};

export default ModelMessageForm;
