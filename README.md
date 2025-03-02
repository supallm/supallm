<p align="center">
  <a href="https://github.com/supallm/supallm"><img src="https://github.com/user-attachments/assets/a848e92f-8f20-43d5-a1e1-e89e68772945" alt="Supallm"></a>
</p>

<p align="center">
    <em>.</em>
</p>

<p align=center>
Supallm is an open-source ecosystem allowing to use AI models directly in your frontend.
</p>

<p align="center">
Ship AI apps in minutes, scale to millions.
</p>

<p align="center">
<a href="" target="_blank">
    <img src="https://img.shields.io/badge/License-Apache 2.0-blue.svg" alt="License version">
</a>
<a href="" target="_blank">
    <img src="https://img.shields.io/badge/Status-Under Active Development-green.svg" alt="Docker Image CI">
</a>
</p>

<p align="center">
.
</p>

<h3 align="center">
🌟 Give us some love by starring this repository! 🌟  
</h3>

<p align="center">
.
</p>

## Quick Start (available soon)

### Run the backoffice

Prerequisites:
- Node.js 10+
- Docker
- Docker Compose

```bash
make up
```

This will start the backoffice and the database, from there you can start configuring your AI models, API keys and system prompts.

### Use the frontend SDK

Install the package using npm or yarn.

```bash
npm i supallm
```

Spin up your first AI call.

```typescript
import { streamText } from 'supallm';
import { openai } from '@supallm/openai';

// Use this directly in your frontend
// Supallm will handle the streaming of the response
// and the authentication for you
const stream = streamText({
    model: openai('gpt-4o'),
    prompt: 'What is the weather in Tokyo?',
});

stream.on('data', (data) => {
    console.log(data);
});

```



<p align="center">
.
</p>

<h3 align="center">
🌟 Give us some love by starring this repository! 🌟  
</h3>

<p align="center">
.
</p>
