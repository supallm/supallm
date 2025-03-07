import { Button } from "@/components/ui/button";
import { FC, useState } from "react";
import ModelMessageForm, { Message } from "./model-message-form";

type ModelMessageListFormProps = {
  messages: Message[];
};

const ModelMessageListForm: FC<ModelMessageListFormProps> = ({ messages }) => {
  const [messageList, setMessageList] = useState(messages);

  const addMessage = () => {
    setMessageList([...messageList, { role: "user", content: "" }]);
  };

  return (
    <div className="flex flex-col gap-2">
      {messageList.map((message, index) => (
        <ModelMessageForm key={index} {...message} />
      ))}
      <Button
        type="button"
        size="xs"
        variant="outline"
        className="w-full"
        onClick={addMessage}
      >
        Add Message
      </Button>
    </div>
  );
};

export default ModelMessageListForm;
