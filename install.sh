#!/usr/bin/env bash
set -e
echo "Welcome to the Code Error Telex Agent Installer!"

read -p "Please enter your Channel Id for the external error reporting service: " CHANNEL_ID
if [ -z "$CHANNEL_ID" ]; then
  echo "Error: Channel Id cannot be empty. Exiting installation."
  exit 1
fi

# Create config directory and file
CONFIG_DIR="$PWD/.code-error-telex-agent"
mkdir -p "$CONFIG_DIR"
CONFIG_FILE="$CONFIG_DIR/config.json"
echo "{\"channelId\": \"$CHANNEL_ID\", \"serviceUrl\": \"https://your-error-service.com/api/errors\"}" > "$CONFIG_FILE"
echo "Configuration saved to $CONFIG_FILE."


echo "Installing the Code Error Telex Agent SDK..."
npm install --save code-error-telex-agent


echo ""
echo "Installation complete! Add the following code to your application's entry point:"
echo ""
echo "const { initErrorAgent } = require('code-error-telex-agent');"
echo "initErrorAgent();"
echo ""
echo "For TypeScript projects:"
echo "import { initErrorAgent } from 'code-error-telex-agent';"
echo "initErrorAgent();"