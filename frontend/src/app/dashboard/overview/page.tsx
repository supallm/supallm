"use client";

import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { Spacer } from "@/components/spacer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { useAppConfigStore } from "@/core/store/app-config";
import { ChatFlowsRoute } from "@/routes";
import { BrainCircuit, Users } from "lucide-react";
import { useRouter } from "next/navigation";

const code = `import { Supallm } from 'supallm';

const supallm = new Supallm({
    apiKey: 'YOUR_API_KEY',
});

const stream = supallm.run({
  flowId: 'YOUR_FLOW_ID',
  input: {
    prompt: 'What is the weather in Tokyo?',
  },
})

stream.on('stream', (data) => {
    console.log('stream', data);
});

stream.on('end', (fullResponse) => {
    console.log('stream', fullResponse);
});
`;

const OverviewPage = () => {
  const { currentProject } = useAppConfigStore();

  if (!currentProject) {
    throw new Error("Project must be defined");
  }

  const router = useRouter();

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
          <Card className="bg-gradient-to-r from-slate-50 via-white to-green-50">
            <CardContent className="space-y-4">
              <div>
                <h1 className="text-lg font-medium flex items-center">
                  <Badge variant={"outline"} className="mr-2">
                    Step 1
                  </Badge>
                  Create an AI Flow
                </h1>
                <p className="text-md text-muted-foreground">
                  Start by creating an AI Flow. Then you can call it directly
                  using our frontend or backend SDK.
                </p>
              </div>
              <div className="space-x-4">
                <Button
                  onClick={() => router.push(ChatFlowsRoute.path())}
                  variant="outline"
                  size={"sm"}
                  className="cursor-pointer"
                >
                  <BrainCircuit /> Create an AI Flow
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-slate-50 via-white to-green-50">
            <CardContent className="space-y-4">
              <div>
                <h1 className="text-lg font-medium flex items-center">
                  <Badge variant={"outline"} className="mr-2">
                    Step 2
                  </Badge>
                  Install the Supallm sdk
                </h1>
                <p className="text-md text-muted-foreground">
                  Start by adding your first Credential. Then you can call it
                  directly by your frontend using the Supallm frontend sdk.
                </p>
              </div>
              <div className="space-y-4">
                <CodeBlock
                  filename=""
                  language="bash"
                  highlightLines={[]}
                  code={"npm install supallm"}
                />
                <CodeBlock
                  language="jsx"
                  filename="YourComponent.tsx"
                  highlightLines={[]}
                  code={code}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Spacer direction="vertical" size="md" />

        <h1 className="text-lg pb-3 font-medium">Explore our other products</h1>

        <div className="flex gap-4">
          <Card className="bg-gradient-to-r from-slate-50 via-white to-slate-50">
            <CardHeader>
              <h1 className="text-md font-medium flex items-center">
                <Users className="mr-2 w-4 h-4" /> Authentication
              </h1>
            </CardHeader>
            <CardContent className="space-x-2">
              <Button variant="outline" size={"sm"} className="cursor-pointer">
                Explore Auth
              </Button>
              <Button variant="outline" size={"sm"} className="cursor-pointer">
                View Docs
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-slate-50 via-white to-slate-50 grow-0">
            <CardHeader>
              <h1 className="text-md font-medium flex items-center">
                <Users className="mr-2 w-4 h-4" /> Quotas
              </h1>
            </CardHeader>
            <CardContent className="space-x-2">
              <Button variant="outline" size={"sm"} className="cursor-pointer">
                Explore Auth
              </Button>
              <Button variant="outline" size={"sm"} className="cursor-pointer">
                View Docs
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </div>
  );
};

export default OverviewPage;
