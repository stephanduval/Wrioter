#!/usr/bin/env node

import WebSocket from "ws";
import fetch from "node-fetch";

// Get list of targets and connect to the Wrioter page
const listTargets = async () => {
  try {
    const response = await fetch("http://localhost:9222/json");
    const targets = await response.json();

    console.log(`Found ${targets.length} open tabs:\n`);
    targets.forEach((t, i) => {
      console.log(`  ${i}: ${t.title || "Unknown"}`);
      console.log(`     ${t.url || "Loading..."}\n`);
    });

    // Find the Wrioter page (filter out data: urls)
    const wrioterPage =
      targets.find((t) => t.url && t.url.includes("stephandouglasduval.com")) ||
      targets.find(
        (t) =>
          t.url && !t.url.startsWith("data:") && !t.url.startsWith("about:"),
      );

    const target = wrioterPage || targets[0];

    if (!target || !target.webSocketDebuggerUrl) {
      console.error("❌ No debuggable pages found");
      console.error(
        "Make sure Vivaldi is open with a page loaded on your phone",
      );
      process.exit(1);
    }

    console.log(`📱 Monitoring: ${target.title || "Unknown"}`);
    console.log(`📍 URL: ${target.url || "Loading..."}`);
    console.log(`✅ Connecting...\n`);
    return target.webSocketDebuggerUrl;
  } catch (err) {
    console.error("❌ Failed to list targets:", err.message);
    process.exit(1);
  }
};

const wsUrl = await listTargets();

// Connect via WebSocket and listen for messages
const ws = new WebSocket(wsUrl);
let messageId = 1;
let eventsReceived = 0;

ws.on("open", () => {
  console.log("🔍 Connected! Waiting for events...");
  console.log(
    "👉 Try interacting with the page on your phone (click, scroll, type, etc.)\n",
  );

  // Enable all debugging domains
  const commands = [
    { method: "Runtime.enable" },
    {
      method: "Network.enable",
      params: {
        maxTotalBufferSize: 10000000,
        maxResourceBufferSize: 5000000,
        maxPostDataSize: 65536,
      },
    },
    { method: "Page.enable" },
    { method: "Log.enable" },
    { method: "Debugger.enable" },
  ];

  commands.forEach((cmd) => {
    const msg = {
      id: messageId++,
      method: cmd.method,
    };
    if (cmd.params) msg.params = cmd.params;
    ws.send(JSON.stringify(msg));
  });
});

ws.on("message", (data) => {
  try {
    const msg = JSON.parse(data);
    const timestamp = new Date().toLocaleTimeString();

    // Count all events (except responses to our commands)
    if (msg.method) {
      eventsReceived++;
    }

    // Console messages
    if (msg.method === "Runtime.consoleAPICalled") {
      const params = msg.params;
      const args = params.args
        .map((arg) => {
          if (arg.value !== undefined) return arg.value;
          if (arg.description) return arg.description;
          if (arg.type === "object") return `[${arg.className}]`;
          return JSON.stringify(arg);
        })
        .join(" ");

      const icon =
        {
          log: "📝",
          info: "ℹ️",
          warning: "⚠️",
          error: "❌",
          debug: "🐛",
          dir: "📂",
          table: "📊",
        }[params.type] || "📝";

      console.log(`${icon} [${timestamp}] ${args}`);
    }

    // Network requests
    if (msg.method === "Network.requestWillBeSent") {
      const params = msg.params;
      const url = new URL(params.request.url);
      const path = url.pathname + url.search;
      console.log(`🌐 [${timestamp}] ${params.request.method} ${path}`);
    }

    // Network responses
    if (msg.method === "Network.responseReceived") {
      const params = msg.params;
      const status = params.response.status;
      const icon = status >= 400 ? "🔴" : status >= 300 ? "🟡" : "🟢";
      const url = new URL(params.response.url);
      const path = url.pathname + url.search;
      console.log(`${icon} [${timestamp}] ${status} ${path}`);
    }

    // Network errors/failures
    if (msg.method === "Network.loadingFailed") {
      const params = msg.params;
      console.log(`❌ [${timestamp}] Network Error: ${params.errorText}`);
    }

    // JavaScript exceptions/errors
    if (msg.method === "Runtime.exceptionThrown") {
      const exception = msg.params.exceptionDetails;
      console.log(`\n❌ [${timestamp}] JavaScript Error: ${exception.text}`);
      if (exception.url) {
        console.log(
          `   ${exception.url}:${exception.lineNumber}:${exception.columnNumber}\n`,
        );
      }
    }

    // Page events
    if (msg.method === "Page.loadEventFired") {
      console.log(`📄 [${timestamp}] Page loaded\n`);
    }

    if (msg.method === "Page.frameNavigated") {
      console.log(`📄 [${timestamp}] Navigation event\n`);
    }
  } catch (e) {
    // Silently ignore unparseable messages
  }
});

ws.on("error", (err) => {
  console.error("❌ WebSocket error:", err.message);
  console.error("\nTroubleshooting:");
  console.error(
    "1. Check port forwarding: adb forward tcp:9222 localabstract:chrome_devtools_remote",
  );
  console.error("2. Make sure Vivaldi is running on your phone");
  console.error("3. Make sure a page is loaded (not blank tab)\n");
});

ws.on("close", () => {
  console.log(`\n⏹️  Stopped. Received ${eventsReceived} events.`);
});

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log("\n⏹️  Stopping monitor...");
  ws.close();
  process.exit(0);
});
