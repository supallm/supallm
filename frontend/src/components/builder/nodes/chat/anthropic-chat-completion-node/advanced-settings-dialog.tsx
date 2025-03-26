import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NumberInput } from "@/components/ui/number-input";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, PropsWithChildren, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const exampleImageAnalyst = `You are an image analyst. Given an image, you must answer the question sent by the user.

Here are a few examples:

Input Prompt: "What is the image about?"
Output: "The image is a beautiful sunset over a calm ocean with a clear sky and a few clouds."

Input: "What is the image about?"
Output: "The image is a close-up of a red apple with a few specks of dust on the surface."

Now, answer the user's questions.`;

const formSchema = z.object({
  systemPrompt: z.string().min(0),
  temperature: z.number().min(0).max(1).nullable(),
  maxTokenToSample: z.number().min(1).nullable(),
});

export const AnthropicChatAdvancedSettingsDialog: FC<
  PropsWithChildren<{
    data: {
      temperature: number | null;
      maxTokenToSample: number | null;
      systemPrompt: string;
    };
    onChange: (values: z.infer<typeof formSchema>) => void;
  }>
> = ({ children, data, onChange }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      temperature: data.temperature ?? null,
      maxTokenToSample: data.maxTokenToSample ?? null,
      systemPrompt: data.systemPrompt ?? "",
    },
  });

  const onOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    setOpen(open);
  };

  async function handleCancel() {
    form.reset();
    setOpen(false);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    onChange(values);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-[900px]">
        <SheetHeader className="border-b">
          <SheetTitle>Advanced settings</SheetTitle>
          <SheetDescription>
            Customize the model behavior according to your needs.
          </SheetDescription>
        </SheetHeader>
        <div className="p-4 overflow-y-auto space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormItem>
                <FormLabel>System Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    {...form.register("systemPrompt")}
                    placeholder="e.g. Respond in Spanish. Keep answers short and focus."
                    className="h-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
              <FormItem>
                <FormLabel>Examples</FormLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    className="rounded-lg"
                    variant={"outline"}
                    onClick={() =>
                      form.setValue(
                        "systemPrompt",
                        fewShotExampleSentimentAnalysis,
                      )
                    }
                  >
                    Sentiment Analyser
                  </Button>
                  <Button
                    type="button"
                    className="rounded-lg"
                    variant={"outline"}
                    onClick={() =>
                      form.setValue("systemPrompt", fewShotExampleJsonAnalysis)
                    }
                  >
                    Yaml to Json Converter
                  </Button>
                  <Button
                    type="button"
                    className="rounded-lg"
                    variant={"outline"}
                    onClick={() =>
                      form.setValue("systemPrompt", exampleImageAnalyst)
                    }
                  >
                    Image analyst
                  </Button>
                </div>
              </FormItem>
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature</FormLabel>
                    <FormControl>
                      <NumberInput
                        placeholder="Default"
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value ?? undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxTokenToSample"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max token to sample</FormLabel>
                    <FormControl>
                      <NumberInput
                        placeholder="Default"
                        value={field.value ?? undefined}
                        onChange={(value) => field.onChange(value)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <SheetFooter>
                <div className="flex justify-end gap-2">
                  <Button onClick={handleCancel} variant={"outline"}>
                    Cancel
                  </Button>
                  <Button type="submit">Confirm</Button>
                </div>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
