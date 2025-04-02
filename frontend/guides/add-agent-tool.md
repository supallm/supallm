# How to add a new tool in the frontend

To add a new tool for the AI Agent node in the frontend you must follow the following steps.

## 1. Add a tool in the AI Agent tool directory

Add a tool in @src/components/builder/nodes/agent-tools/<your-tool-name>/<your-tool-name.tsx>

You can use an existing tool as a base such as @src/components/builder/nodes/agent-tools/chat-openai-as-tool-node/chat-openai-as-tool-node.tsx

Then follow the following:

- Name the component with the tool name
- Make sure to add the correct properties
-
