// suppressLogs.js
(function () {
    const originalWarn = console.warn;
    console.warn = function (...args) {
      if (args[0] === "Invalid song data:") {
        return; // Suppress "Invalid song data" logs
      }
      originalWarn.apply(console, args);
    };
  })();