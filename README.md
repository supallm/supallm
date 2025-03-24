<p align="center">
  <a href="https://github.com/supallm/supallm"><img src="https://github.com/user-attachments/assets/a848e92f-8f20-43d5-a1e1-e89e68772945" alt="Supallm"></a>
</p>

<p align="center">
    <em>.</em>
</p>

<p align=center>
Supallm is an open-source platform allowing to build multi-AI-powered flows in no-code. Then you can trigger them and stream their output in realtime into your application.
</p>

<p align="center">
Supallm is built in Golang for high performance and scalability making it ideal to prototype but also for real-world Enterprise usecases.
</p>

<p align="center">
<a href="" target="_blank">
    <img src="https://img.shields.io/badge/License-Apache 2.0-blue.svg" alt="License version">
</a>
<a href="" target="_blank">
    <img src="https://img.shields.io/badge/Status-Alpha Released:stable coming soon-green.svg" alt="Docker Image CI">
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

Our powerful editor allows you to build and run complex AI flows in seconds. Unlike other tools, you can customize the inputs and outputs of your flows. Every output field result can be streamed in realtime to your frontend with almost no latency.

![main-concept-1](https://github.com/user-attachments/assets/1cc425ff-cd0b-4428-9992-0124ee610e20)

### 2. Test your flows in our editor

Stop writing code, just test your flows right in the editor.

![main-concept-2](https://github.com/user-attachments/assets/2059789e-9c28-4bda-88dd-f61410a02cb2)

### 3. Use them in realtime in your code

We integrate with all the major authentication providers to securely run your flows either from your frontend or backend. Our simple SDK allows you to run your flows in seconds and listen to the results in realtime.

![main-concept-3](https://github.com/user-attachments/assets/d7a9b12d-2a67-4e7d-83e0-07df3a2694b2)


## ⚡ Quick Start

Prerequisites:
- Node.js 20+
- Docker and Docker Compose

```bash
npx install-supallm@latest
```

Et voilà! The CLI will walk you through the installation process.

Once finished you will get a `docker-compose.yml` and a `.env` file that you will be able to customize but it's not required.


## 🐳 Customize your installation

We recommend using the CLI (above) to install Supallm. The CLI will download the required files and help you to setup your first required variables.

Once installed you will be able to customize your docker-compose.yml and your environment variables.

**If you can't use the CLI for any reason simply open an issue.**

**The CLI will guide you to configure the required variables.  In case you want to go further, you can open the .env file and check for the variable definitions you can customize.**


## 👨‍💻 Integrate in your application

Once you've built your flow, you can use our [isomorphic Javascript SDK](https://www.npmjs.com/package/supallm) to run it from your code.

**1. Install the package using npm or yarn.**

```bash
npm i supallm
```

**2. Run your flow with realtime updates:**

```typescript
import { initSupallm } from 'supallm';

const supallm = initSupallm({
    secretKey: 'your-api-key',
    projectId: 'your-project-id',
});

const sub = await supallm.runFlow({
    flowId: 'your-flow-id',
    inputs: {
        yourCustomInput: 'What is the capital of France?',
    },
}).subscribe();

sub.on('flowResultStream', (data) => {
    console.log('Received realtime result chunk', data);
});

sub.on('flowEnded', (event) => {
    console.log('Flow ended with result', event.result);
});

sub.on('flowFail', (event) => {
    console.log('Flow failed with error', event.result);
});

sub.on('nodeStart', (event) => {
    console.log('Node started', event.nodeId);
});

sub.on('nodeEnd', (event) => {
    console.log('Node ended', event.nodeId);
});

sub.on('nodeFail', (event) => {
    console.log('Node failed', event.nodeId);
});

```

Or you can use wait for the flow to complete and get the full result:

```typescript
const response = await supallm.runFlow({
    flowId: 'your-flow-id',
    inputs: {
        yourCustomInput: 'What is the capital of France?',
    },
}).wait();

// Since we believe exceptions are hell, we don't throw errors.
// Instead we return a response object with the following properties:

response.isSuccess // true if the flow ran successfully
response.result
```



## ⚙️ Our low-latency, high-performance and scalable stack

Unlike other tools, we're crafting Supallm with performance in mind.

- We use Postgres as the main database.
- Backend in Golang is stateless, horizontally scalable and highly-available.
- Our runners pull jobs from a Redis Queue and run code execution in a sandboxed environment.
- Our frontend is built with Next.js and TypeScript.

## 🔒 Security

- Code is compiled and run in a sandboxed environment using the great [nsjail](https://github.com/google/nsjail) project by Google.
- All sensitive data is encrypted and never shared in the logs.

## 📈 Performance

Once a flow started, there is no overhead compared to running the same flow from your code. The added latency from a job being pulled from the queue, started, and then having its result sent back to the database is ~50ms.

Our backend API and runners are designed to be stateless and horizontally scalable.

<p align="center">
.
</p>

<h3 align="center">
🌟 Give us some love by starring this repository! 🌟  
</h3>

<p align="center">
.
</p>
