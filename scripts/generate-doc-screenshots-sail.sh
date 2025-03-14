#!/bin/bash

# Change to the project directory
cd "$(dirname "$0")/.."

# Make sure the screenshots directory exists
mkdir -p docs/assets/screenshots

# Run the Dusk tests using Sail
echo "Running Dusk tests to generate screenshots..."
# Run the tests, making sure previous database is cleared
sail dusk --pest

# The screenshots are already saved to docs/assets/screenshots by the test

echo "Done! Screenshots have been generated in the docs/assets/screenshots directory."
