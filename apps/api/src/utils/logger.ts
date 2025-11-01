import pino from "pino";
import prettyLogs from "pino-pretty";
import { tmpdir } from "os";
import { join } from "path";

const file = join(tmpdir(), `${process.pid}-audit-logs`);

const transport = pino.transport({
  targets: [
    {
      level: "error",
      target: "pino/file",
      options: {
        destination: file,
      },
    },
    {
      level: "warn",
      target: "pino/file",
      options: {
        destination: file,
      },
    },
    {
      level: "info",
      target: "pino-pretty",
    },
  ],
});

const applogger = pino(prettyLogs(transport));

interface QueueLoggerOptions {
  showPulse: boolean;
  showReservation: boolean;
  showCompletion: boolean;
  showErrors: boolean;
  prefix: string;
}

class QueueLogger {
  protected showPulse: boolean;
  protected showReservation: boolean;
  protected showCompletion: boolean;
  protected showErrors: boolean;
  protected prefix: string;

  constructor(options: QueueLoggerOptions) {
    this.showPulse = options.showPulse ?? false;
    this.showReservation = options.showReservation ?? true;
    this.showCompletion = options.showCompletion ?? true;
    this.showErrors = options.showErrors ?? true;
    this.prefix = options.prefix || "";
  }

  _shouldSkip(msg: string) {
    // Skip pulse logs unless explicitly enabled
    if (!this.showPulse) {
      if (
        msg.includes("Blocking timeout") ||
        msg.includes("ReserveBlocking completed")
      ) {
        return true;
      }
    }

    // Skip reservation logs if disabled
    if (!this.showReservation && msg.includes("Reserved job")) {
      return true;
    }

    // Skip completion logs if disabled
    if (!this.showCompletion && msg.includes("Completed job")) {
      return true;
    }

    return false;
  }

  debug(msg: string, ...args: string[]) {
    if (this._shouldSkip(msg)) return;
    applogger.debug(`${this.prefix}[DEBUG] ${msg}, ${[...args]}`);
  }

  info(msg: string, ...args: string[]) {
    if (this._shouldSkip(msg)) return;
    applogger.info(`${this.prefix}[INFO] ${msg}, ${[...args]}`);
  }

  warn(msg: string, ...args: string[]) {
    applogger.warn(`${this.prefix}[WARN] ${msg}, ${[...args]}`);
  }

  error(msg: string, ...args: string[]) {
    if (!this.showErrors) return;
    applogger.error(`${this.prefix}[ERROR] ${msg}, ${[...args]}`);
  }
}

const queueLogger = new QueueLogger({
  showPulse: false, // Hide pulse logs
  showReservation: true, // Show when jobs are picked up
  showCompletion: true, // Show when jobs complete
  showErrors: true, // Always show errors
  prefix: "[Polkalines Pipelines] ", // Add prefix to all logs
});

export { applogger, queueLogger };
