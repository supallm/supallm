"use client";

import { CopiableKey } from "@/components/copiable-key";
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
        <h1 className="text-lg pb-3 font-medium">Project settings</h1>

        <div className="flex flex-col gap-4 mt-5">
          <Card className="bg-gradient-to-r from-slate-50 via-white to-green-50 pt-0">
            <div className="text-lg font-medium flex flex-col my-0 py-0 border-b py-5 px-6 space-y-2">
              <h1>API Key </h1>
              <div>
                <p className="text-sm text-muted-foreground">
                  Your flows are secured behind an API gateway which requires an
                  API Key for every request.
                </p>
                <p className="text-sm text-muted-foreground">
                  You can use the keys below in the Supallm client libraries.
                </p>
              </div>
            </div>
            <div className="divide-y">
              <div className="py-4 px-6 flex justify-between gap-4">
                <div>
                  <span className="text-lg font-medium flex items-center mt-0">
                    Public API Key
                  </span>
                  <p className="text-muted-foreground text-sm">
                    This key is safe to use in a browser if you have enabled
                    authentication with your favorite provider.
                  </p>
                </div>
                <div className="shrink-0">
                  <CopiableKey
                    className="w-[500px]"
                    width="full"
                    size="md"
                    value={`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJanVxbWlycWtnZ3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODk5MzUsImV4cCI6MjA1NjU2NTkzNX0.A42ENSTqP7JNjSri4YP0JKcPk1NIkyBWwI1DKlJ0VxA`}
                  />
                </div>
              </div>
              <div className="py-4 px-6 flex justify-between gap-4">
                <div>
                  <span className="text-lg font-medium flex items-center mt-0">
                    Secret API Key
                  </span>
                  <p className="text-muted-foreground text-sm">
                    This key allows access to your flows. Never share it
                    publicly. If leaked, generate a new secret key immediately.
                  </p>
                </div>
                <div className="shrink-0">
                  <CopiableKey
                    isSecret
                    className="w-[500px]"
                    width="full"
                    size="md"
                    value={`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJanVxbWlycWtnZ3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODk5MzUsImV4cCI6MjA1NjU2NTkzNX0.A42ENSTqP7JNjSri4YP0JKcPk1NIkyBWwI1DKlJ0VxA`}
                  />
                </div>
              </div>
            </div>
          </Card>
          <Spacer direction="vertical" size="sm" />

          <h1 className="text-lg pb-3 font-medium">Getting Started</h1>
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
