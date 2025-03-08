import { Spacer } from "@/components/spacer";
import { Button } from "@/components/ui/button";
import { FormDescription, FormItem, FormLabel } from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { FC, PropsWithChildren, useState } from "react";
const fewShotExampleSentimentAnalysis = `You are an AI that performs sentiment analysis on text inputs. Given a sentence, you must classify it as Positive, Negative, or Neutral.

Here are a few examples:

Input: "I absolutely love this product! It's amazing."
Output: Positive

Input: "This is the worst service I have ever experienced."
Output: Negative

Input: "The movie was okay, nothing special."
Output: Neutral

Input: "The support team was very helpful and resolved my issue quickly."
Output: Positive

Input: "I waited for an hour, and no one came to assist me."
Output: Negative

Input: "The food was neither great nor terrible, just average."
Output: Neutral

Now, classify the sentiment of the following sentences:`;

const fewShotExampleJsonAnalysis = `You are an AI that converts YAML into JSON format. Given a YAML input, return the correctly formatted JSON output.

Here are a few examples:

Input: "name: John Doe"
Output: {"name": "John Doe"}

Input: "age: 30"
Output: {"age": 30}

Input: "is_active: true"
Output: {"is_active": true}

Now, convert the following Yaml to Json:`;

export const ConfigureModelMessagesDialog: FC<
  PropsWithChildren<{
    developerMessage: string;
    onChange: (developerMessage: string) => void;
  }>
> = ({ children, developerMessage, onChange }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(developerMessage);

  const onOpenChange = (open: boolean) => {
    setMessage(developerMessage);
    setOpen(open);
  };

  async function handleConfirm() {
    onChange(message);
    setOpen(false);
  }

  async function handleCancel() {
    setMessage(developerMessage);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-[900px]">
        <SheetHeader className="border-b">
          <SheetTitle>Configure the developer message</SheetTitle>
          <SheetDescription>Also known as the System Message.</SheetDescription>
        </SheetHeader>
        <div className="p-4 overflow-y-auto space-y-4">
          <FormItem>
            <FormLabel>Developer Message</FormLabel>
            <FormDescription>
              You can ask the model to focus on certain topics, or ask it to use
              a certain tone or format for responses. We also recommend giving
              examples to the model to help it understand the task.
            </FormDescription>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Respond in Spanish. Keep answers short and focus."
              className="h-80"
            />
          </FormItem>
          <Spacer size="xs" />
          <FormItem>
            <FormLabel>Examples</FormLabel>
            <div className="flex gap-2">
              <Button
                className="rounded-lg"
                variant={"outline"}
                onClick={() => setMessage(fewShotExampleSentimentAnalysis)}
              >
                Sentiment Analyser
              </Button>
              <Button
                className="rounded-lg"
                variant={"outline"}
                onClick={() => setMessage(fewShotExampleJsonAnalysis)}
              >
                Yaml to Json Converter
              </Button>
            </div>
          </FormItem>
        </div>

        <SheetFooter>
          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel} variant={"outline"}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
