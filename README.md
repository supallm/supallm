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

## Demo

https://github.com/user-attachments/assets/d3b67c6c-4059-4f7e-b5ad-3e27c1c7c858

## Main Concepts

### 1. Build advanced AI-based flows

![main-concept-1](https://github.com/user-attachments/assets/1cc425ff-cd0b-4428-9992-0124ee610e20)

### 2. Test your flows in our editor

![main-concept-2](https://github.com/user-attachments/assets/2059789e-9c28-4bda-88dd-f61410a02cb2)

### 3. Use them in realtime in your code

![main-concept-3](https://github.com/user-attachments/assets/d7a9b12d-2a67-4e7d-83e0-07df3a2694b2)

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
