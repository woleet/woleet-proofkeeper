export class LogContext {
  logs?: Log[];
  logsAccumulator?: string;
  launched?: boolean;
  exitCode?: number;
}

export class Log {
  level: string;
  msg: string;
}
