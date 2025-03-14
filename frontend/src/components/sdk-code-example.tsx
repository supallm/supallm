import { FC, useMemo } from "react";
import { CodeBlock } from "./ui/code-block";

export const SdkCodeExample: FC<{
  projectId: string;
  secretKey: string;
  flowId: string;
  inputs: { label: string; value: string }[];
  showInitSdk: boolean;
}> = ({ projectId, secretKey, flowId, inputs, showInitSdk }) => {
  const flowInputObjectExample = useMemo(() => {
    const inputObject: Record<string, string> = {};
    inputs.forEach((input) => {
      inputObject[input.label] = input.value;
    });

    return inputObject;
  }, [inputs]);

  const flowCodeSnippetStream = useMemo(() => {
    const formattedInput = JSON.stringify(flowInputObjectExample, null, 4)
      .split("\n")
      .map((line, index) => `${index === 0 ? "" : "    "}${line}`)
      .join("\n");

    return `import { supallm } from './supallm';

const sub = supallm.run({
    flowId: '${flowId}',
    inputs: ${formattedInput}
}).subscribe();

sub.on('data', (data) => {
    console.log(\`Field \${data.fieldName} received value \${data.value}\`);
});

sub.on('complete', (fullResult) => {
    console.log('Full aggregated result', fullResult);
});

sub.on('error', (error) => {
    console.error(error);
});
    `;
  }, [flowInputObjectExample]);

  const flowCodeSnippetPromise = useMemo(() => {
    const formattedInput = JSON.stringify(flowInputObjectExample, null, 4)
      .split("\n")
      .map((line, index) => `${index === 0 ? "" : "    "}${line}`)
      .join("\n");

    return `import { supallm } from './supallm';

const result = await supallm.run({
    flowId: '${flowId}',
    inputs: ${formattedInput}
}).wait();

console.log('Full aggregated result', result);
    `;
  }, [flowInputObjectExample]);

  const tabs = [
    {
      language: "typescript",
      highlightLines: [],
      code: flowCodeSnippetStream,
      name: "Realtime version",
    },
    {
      language: "typescript",
      highlightLines: [],
      code: flowCodeSnippetPromise,
      name: "Promise version",
    },
  ];

  const initSDK = {
    language: "typescript",
    highlightLines: [],
    code: `import { initSupallm } from 'supallm';

export const supallm = initSupallm({
    projectId: '${projectId}',
    secretKey: '${secretKey}',
});`,
    name: "supallm.ts",
  };

  return (
    <div className="flex flex-col gap-4">
      {showInitSdk && (
        <>
          <h2>Initialize the sdk</h2>
          <CodeBlock
            filename="your-code.ts"
            language="typescript"
            tabs={[initSDK]}
          />
        </>
      )}
      <h2>Run the flow</h2>
      <CodeBlock filename="your-code.ts" language="typescript" tabs={tabs} />
    </div>
  );
};
