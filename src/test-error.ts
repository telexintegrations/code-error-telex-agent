// This will trigger an uncaught exception to test the agent
setTimeout(() => {
    throw new Error("Test Error: This is a simulated uncaught exception.");
  }, 2000);
  