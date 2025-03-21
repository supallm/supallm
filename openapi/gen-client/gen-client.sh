#! /bin/bash

set -e

echo "🚀 Generating typescript client..."

npx --yes openapi-typescript-codegen \
  --input ../spec.yaml \
  --output ./src \
  --useOptions \
  --useUnionTypes

cp client.ts src/



echo 'export { getToken } from "./client";' >> src/index.ts
# e
# rm -rf ../../frontend/src/lib/services/gen-api
# # important: gen-api folder must be in .gitignore since we don't want to commit it.
# cp -R ./src ../../frontend/src/lib/services/gen-api

echo -e "✅ Done!\n"