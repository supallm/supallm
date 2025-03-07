import { FormControl } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FC, useState } from "react";

export const MessageRoles = ["user", "assistant", "system"] as const;

export type MessageRole = (typeof MessageRoles)[number];

export type Message = {
  role: MessageRole;
  content: string;
};

export type ModelMessageFormProps = {
  role: MessageRole;
  content: string;
};

const ModelMessageForm: FC<ModelMessageFormProps> = (props) => {
  const [role, setRole] = useState<MessageRole>(props.role);
  const [content, setContent] = useState(props.content);

  return (
    <div className="flex flex-col gap-2">
      <Select
        onValueChange={(value) => setRole(value as MessageRole)}
        defaultValue={role}
      >
        <FormControl className="w-full">
          <SelectTrigger>
            <SelectValue placeholder="Select the model to use" />
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
    </div>
  );
};

export default ModelMessageForm;
