"use client";

import { CodeBlock } from "@/components/ui/code-block";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import { FC, PropsWithChildren } from "react";
import { useAppConfig } from "@/hooks/use-app-config";
import { useAppConfigStore } from "@/core/store/app-config";

const code = `import { streamText } from 'supallm';
import { openai } from '@supallm/openai';

// Use this directly in your frontend
// Supallm will handle the streaming of the response
// and the authentication for you
const stream = streamText({
    model: openai('gpt-4o'), // Replace with your model
    prompt: 'What is the weather in Tokyo?',
});

stream.on('data', (data) => {
    console.log(data);
});
`;

export const OverviewPage: FC<PropsWithChildren<{}>> = () => {
  const { currentProject } = useAppConfigStore();

  if (!currentProject) {
    throw new Error("Project must be defined");
  }

  return (
    <div className="pb-15">
      <PageHeader title={currentProject.name} noBorder />
      <PageContainer>
        <h1 className="text-lg pb-3 font-medium">
          Welcome to your new project
        </h1>
        <p className="text-md text-muted-foreground">
          This page will help you get started with your new project.
        </p>
        <div className="flex flex-col gap-4 mt-20">
          <Card>
            <CardContent className="space-y-4">
              <div>
                <h1 className="text-lg font-medium flex items-center">
                  <Badge variant={"outline"} className="mr-2">
                    Step 1
                  </Badge>
                  Add your first LLM provider
                </h1>
                <p className="text-md text-muted-foreground">
                  Start by adding your first LLM provider. Then you can call it
                  directly by your frontend using the Supallm frontend sdk.
                </p>
              </div>
              <div>
                <Button variant="outline" size={"sm"}>
                  <BrainCircuit /> Add LLM provider
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4">
              <div>
                <h1 className="text-lg font-medium flex items-center">
                  <Badge variant={"outline"} className="mr-2">
                    Step 2
                  </Badge>
                  Install the Supallm frontend sdk
                </h1>
                <p className="text-md text-muted-foreground">
                  Start by adding your first LLM provider. Then you can call it
                  directly by your frontend using the Supallm frontend sdk.
                </p>
              </div>
              <div className="space-y-4">
                <CodeBlock
                  filename=""
                  language="bash"
                  highlightLines={[9, 13, 14, 18]}
                  code={"npm install supallm @supallm/openai"}
                />
                <CodeBlock
                  language="jsx"
                  filename="DummyComponent.jsx"
                  highlightLines={[9, 13, 14, 18]}
                  code={code}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </div>
  );
};

export default OverviewPage;
