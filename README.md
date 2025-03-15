# Code Error Telex Agent Integration - v1.0

## Overview

The Code Error Agent Integration is a lightweight tool designed to capture errors in your codebase using static analysis tools such as ESLint, the TypeScript compiler, Prettier, or Flake8 (for Python). It categorizes and prioritizes errors and sends detailed error reports directly to a Telex channel.

## Features

- **Static Analysis Integration**: Automatically detects errors in codebases in realtime.
- **Error Categorization**:
  - **Syntax Errors**
  - **Type Errors**
  - **Linting Violations**
- **Prioritization**:
  - **High**: Breaking errors
  - **Medium**: Warnings
  - **Low**: Style violations
- **Telex Reporting**: Pushes error logs to a Telex channel for real-time monitoring.

## Prerequisites

- **Environment**:
  - Node.js (for JavaScript/TypeScript projects) or Python (for Python projects).
- **Static Analysis Tools**:
  - JavaScript/TypeScript: ESLint, TypeScript compiler, Prettier.
  - Python: Flake8.
- **Telex Access**: Valid credentials and API access to your Telex channel.

## Installation

```
npm install code error agent
```

Then add this code snippet to your entry file

```
import { initializeTelexSDK } from 'code-error-telex-agent-handler';

async () => {
await initializeTelexSDK({
channelId
:"01959417-7ea6-78ab-85ac-493ac366ff0e",
});
}()

```

Check The Telex Channel for your code error logs
