#!/bin/sh

# Exit on error AND print every command executed
set -ex

echo "================================================="
echo "======      START.SH SCRIPT STARTED      ======"
echo "================================================="
echo " "
echo ">>> Who am I: $(whoami)"
echo ">>> Working Directory: $(pwd)"
echo ">>> Listing files in /app:"
ls -la /app
echo " "
echo ">>> Listing files in /app/scripts:"
ls -la /app/scripts
echo " "
echo ">>> Listing files in /app/dist:"
ls -la /app/dist
echo " "
echo ">>> Displaying Environment Variables:"
printenv
echo " "
echo "================================================="
echo "======      EXECUTING MIGRATIONS         ======"
echo "================================================="

# Execute the migrations. The `set -e` will cause the script to exit if this fails.
npm run migration:run

echo " "
echo "================================================="
echo "======   MIGRATIONS FINISHED, STARTING APP   ======"
echo "================================================="

# Start the application
# `exec` replaces the shell process with the node process.
exec node dist/main.js
