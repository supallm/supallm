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

Our powerful editor allows you to build and run complex AI flows in seconds. Unlike other tools, you can customize the inputs and outputs of your flows. Every output field result can be streamed in realtime to your frontend with almost no latency.

![main-concept-1](https://github.com/user-attachments/assets/1cc425ff-cd0b-4428-9992-0124ee610e20)

### 2. Test your flows in our editor

Stop writing code, just test your flows right in the editor.

![main-concept-2](https://github.com/user-attachments/assets/2059789e-9c28-4bda-88dd-f61410a02cb2)

### 3. Use them in realtime in your code

We integrate with all the major authentication providers to securely run your flows either from your frontend or backend. Our simple SDK allows you to run your flows in seconds and listen to the results in realtime.

![main-concept-3](https://github.com/user-attachments/assets/d7a9b12d-2a67-4e7d-83e0-07df3a2694b2)


## Our low-latency, high-performance and scalable stack

Unlike other tools, we're crafting Supallm with performance in mind.

- We use Postgres as the main database.
- Backend in Golang is stateless, horizontally scalable and highly-available.
- Our runners pull jobs from a Redis Queue and run code execution in a sandboxed environment.
- Our frontend is built with Next.js and TypeScript.

## Performance

Once a flow started, there is no overhead compared to running the same flow from your code. The added latency from a job being pulled from the queue, started, and then having its result sent back to the database is ~50ms.

Our backend API and runners are designed to be stateless and horizontally scalable.

## How to self-host

The easiest way to self-host Supallm is to use our Docker image. Later we'll provide a Helm chart and more options.

### Docker compose (WIP)

Prerequisites:
- Node.js 20+#
- Docker
- Docker Compose

You only need two files to start supallm:
- the .env file that contains your environment variables (see next section to customize it)
- the docker-compose.yml file


#### Run the installation script

```bash
curl -fsSL https://raw.githubusercontent.com/supallm/supallm/main/install.sh | sh
```

This script will download the docker-compose.yml and .env file in the current directory.

Once done, update the downloaded .env file with the environment variables.

Then, simply run `docker compose up -d`.

Et voilà! Your Supallm dashboard is running at http://localhost:3001 (or the port of your choice if you updated it).

#### Update the .env file

| Environment Variable     | Description                                                                 | Default Value          | To Change |
|--------------------------|-----------------------------------------------------------------------------|------------------------|--------------------|
| CLERK_PUBLISHABLE_KEY    | The publishable key for Clerk authentication.                                | (empty)                | Required                |
| CLERK_SECRET_KEY         | The secret key for Clerk authentication.                                     | (empty)                | Required                |
| OPENAI_API_KEY           | The API key for accessing OpenAI services.                                   | (empty)                | Required                |
| POSTGRES_USER            | The username for the PostgreSQL database.                                   | postgres               | Optional                |
| POSTGRES_PASSWORD        | The password for the PostgreSQL database.                                   | postgres               | Optional                |
| POSTGRES_DB              | The name of the PostgreSQL database.                                         | supallm                | Optional                |
| POSTGRES_HOST            | The hostname of the PostgreSQL database.                                     | supallm-pg             | Optional                |
| POSTGRES_PORT            | The port number on which the PostgreSQL database is running.                 | 5432                   | Optional                |
| FRONTEND_PORT            | The port number on which the frontend server will run.                       | 3000                   | Optional                |
| BACKEND_PORT             | The port number on which the backend server will run.                        | 3001                   | Optional                |
| SECRET_KEY               | A secret key used for encryption.                                            | sm4t...uyY | Advised                |
| REDIS_HOST               | The hostname of the Redis server.                                            | supallm-redis          | Optional                |
| REDIS_PORT               | The port number on which the Redis server is running.                        | 6379                   | Optional                |
| REDIS_PASSWORD           | The password for the Redis server.                                           | redis                  | Optional                |


#### Run the docker compose file

```bash
docker compose up -d
```

Et voilà, you're ready to start using Supallm on http://localhost:3000.


## Use our isomorphic Javascript SDK

Once you've built your flow, you can our SDK to run it from your code.

Install the package using npm or yarn.

```bash
npm i supallm
```

Run your flow with realtime updates:

```typescript
import { initSupallm } from 'supallm';

const supallm = initSupallm({
    secretKey: 'your-api-key',
    projectId: 'your-project-id',
});

const sub = await supallm.runFlow('your-flow-id').subscribe();

sub.on('data', (data) => {
    console.log(data);
});

sub.on('complete', (fullResult) => {
    console.log(fullResult);
});

sub.on('error', (error) => {
    console.error(error);
});

```

Or you can use wait for the flow to complete and get the full result:

```typescript
const result = await supallm.runFlow('your-flow-id').wait();
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
