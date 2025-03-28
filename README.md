# Error-Telex

[![npm version](https://badge.fury.io/js/error-telex.svg)](https://www.npmjs.com/package/error-telex)
[![Node.js Version](https://img.shields.io/node/v/error-telex.svg)](https://nodejs.org)

A real-time error monitoring system that automatically captures errors in your Node.js applications and sends them to your Telex channel, complete with AI-generated fix suggestions. Get instant notifications and smart solutions for your application errors.

## Key Features

- **AI-Powered Error Solutions**
  - Instant fix suggestions for each error
  - Context-aware code recommendations
  - Best practice guidance
  - Alternative solution options

- **Automatic Error Detection**
  - Unhandled exceptions
  - Unhandled promise rejections
  - Process warnings
  - Runtime errors

- **Smart Error Processing**
  - Detailed error context capture
  - Stack trace analysis
  - Error categorization
  - Priority-based handling

- **Reliable Delivery**
  - ZeroMQ-based communication
  - Automatic HTTP fallback
  - Guaranteed message delivery

## Installation

```bash
npm install error-telex
```

## Quick Setup

1. Get your Telex Channel ID from your Telex dashboard
2. Add to your application's entry point:

```typescript
import { initializeTelexSDK } from "error-telex";

await initializeTelexSDK({
  channelId: "your-telex-channel-id"
});
```

For JavaScript:
```javascript
const { initializeTelexSDK } = require("error-telex");

await initializeTelexSDK({
  channelId: "your-telex-channel-id"
});
```

## How It Works

1. **Error Detection**: When an error occurs in your application, Error-Telex automatically captures it
2. **Analysis**: The error is analyzed for context, stack trace, and potential causes
3. **AI Processing**: Our AI engine processes the error and generates fix suggestions
4. **Delivery**: Error details and AI-suggested fixes are sent to your Telex channel
5. **Solution**: You receive:
   - Detailed error information
   - AI-generated fix suggestions
   - Code examples for implementation
   - Best practice recommendations

## Example Error Report in Telex

```plaintext
🚨 Error Detected
Type: UnhandledPromiseRejection
Message: Cannot read property 'data' of undefined

📍 Location: src/services/userService.ts:45
Stack: UserService.getUserData
      at processRequest (/src/api/handlers.ts:30)

💡 AI-Suggested Fix:
"Add null checking before accessing the data property:

// Current code
const userData = response.data;

// Recommended fix
const userData = response?.data ?? defaultUserData;

🔍 Additional Context:
- Always validate API responses
- Consider adding a type guard
- Implement error boundaries"
```

## Requirements

- Node.js version 16.0.0 or higher
- Valid Telex channel ID

## Express.js Integration Example

```typescript
import express from "express";
import { initializeTelexSDK } from "error-telex";

const app = express();

// Initialize Error-Telex with AI monitoring
await initializeTelexSDK({
  channelId: process.env.TELEX_CHANNEL_ID
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Example error that will be caught and analyzed by AI
app.get("/users", (req, res) => {
  throw new Error("User service unavailable");
  // Error-Telex will catch this and provide AI-suggested fixes
});

app.listen(3000, () => {
  console.log("Server running with Error-Telex AI monitoring");
});
```

## Verification Steps

1. Initialize Error-Telex in your application
2. Check your Telex channel for the connection confirmation
3. Any errors will appear with:
   - Detailed error information
   - Stack trace
   - AI-generated fix suggestions
   - Implementation examples
   - Best practices

## Troubleshooting

If you're not receiving error reports or AI suggestions:
1. Verify your Channel ID
2. Check your internet connection
3. Ensure Node.js version ≥ 16.0.0

## Support

- NPM Package: [error-telex](https://www.npmjs.com/package/error-telex)

## License

ISC License
