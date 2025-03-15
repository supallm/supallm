#!/bin/sh
set -e

echo "Starting in MODE: $MODE"

case "$MODE" in
  api)
    echo "Running API Server..."
    exec /app/server
    ;;
  frontend)
    echo "Running Frontend..."
    #!/bin/sh


    ##
    # START REPLACING CLERK PUBLIC KEY
    #
    # Since Clerk does not allow to pass a public key at runtime
    # we need to build it with a real public key and to replace it at runtime.
    # This piece will replace the Clerk publishable key everywhere in the
    # next.js dist directory.
    ##
    DIR="/app/frontend"
    OLD_KEY="pk_test_cHJvbXB0LWNvcmFsLTcwLmNsZXJrLmFjY291bnRzLmRldiQ"
    NEW_KEY="${CLERK_PUBLIC_KEY}"

    find "$DIR" -type f -exec sed -i "s|$OLD_KEY|$NEW_KEY|g" {} +    
    ##
    # END REPLACING CLERK PUBLIC KEY
    ##

    exec npm run start --prefix /app/frontend
    ;;
  runner)
    echo "Running Runner..."
    ls -la /app/runner
    exec npm start --prefix /app/runner
    ;;
  *)
    echo "Error: Invalid MODE. Use 'api', 'frontend', or 'runner'."
    exit 1
    ;;
esac
