const { spawn, exec } = require("node:child_process");
const { promisify } = require("node:util");
const execAsync = promisify(exec);

async function isOllamaRunning() {
  try {
    await execAsync('pgrep -f "ollama serve"');
    return true;
  } catch {
    return false;
  }
}

async function pullDefaultModel() {
  const model = process.env.OLLAMA_MODEL || "qwen3:8b";
  console.log(`Checking if ${model} is available...`);

  try {
    const { stdout } = await execAsync("ollama list");
    if (stdout.includes(model)) {
      console.log(`${model} is already available`);
    } else {
      console.log(`Pulling ${model}...`);
      await execAsync(`ollama pull ${model}`);
      console.log(`Successfully pulled ${model}`);
    }
  } catch (error) {
    console.warn(`Could not check/pull model: ${error.message}`);
  }
}

async function startOllama() {
  const isRunning = await isOllamaRunning();

  if (isRunning) {
    console.log("Ollama is already running");
    await pullDefaultModel();
    // Keep the process alive
    const KEEP_ALIVE_INTERVAL_MS = 1000;
    setInterval(() => {
      /* Keep process alive */
    }, KEEP_ALIVE_INTERVAL_MS);
    return;
  }

  console.log("Starting Ollama serve...");
  const ollama = spawn("ollama", ["serve"], {
    stdio: "inherit",
    env: process.env,
  });

  ollama.on("error", (error) => {
    console.error("Failed to start Ollama:", error.message);
    console.error("Make sure Ollama is installed: https://ollama.ai");
    process.exit(1);
  });

  // Give Ollama time to start before pulling the model
  const OLLAMA_STARTUP_DELAY_MS = 3000;
  setTimeout(async () => {
    await pullDefaultModel();
  }, OLLAMA_STARTUP_DELAY_MS);

  process.on("SIGINT", () => {
    console.log("\nStopping Ollama...");
    ollama.kill();
    process.exit(0);
  });
}

startOllama().catch(console.error);
