import { FormDescription, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FC } from "react";

const DeveloperMessageForm: FC = () => {
  return (
    <FormItem>
      <FormLabel>Developer Message</FormLabel>
      <FormDescription>
        This is the Developer Message (aka System Message). You can ask the
        model to focus on certain topics, or ask it to use a certain tone or
        format for responses.
      </FormDescription>
      <Textarea
        placeholder="e.g. Respond in Spanish. Keep answers short and focus."
        className="h-80"
      />
    </FormItem>
  );
};

export default DeveloperMessageForm;
