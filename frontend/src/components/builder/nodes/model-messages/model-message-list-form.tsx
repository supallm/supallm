import { FC, useState } from "react";
import DeveloperMessageForm from "./developer-message-form";
import { Message } from "./model-message-form";

type ModelMessageListFormProps = {
  messages: Message[];
};

const ModelMessageListForm: FC<ModelMessageListFormProps> = ({ messages }) => {
  const [messageList, setMessageList] = useState(messages);

  const addMessage = () => {
    setMessageList([...messageList, { role: "user", content: "" }]);
  };

  const removeMessage = (index: number) => {
    const newMessageList = [...messageList];
    newMessageList.splice(index, 1);
    setMessageList(newMessageList);
  };

  return (
    <div className="flex flex-col gap-2">
      <DeveloperMessageForm />
    </div>
  );
};

export default ModelMessageListForm;
