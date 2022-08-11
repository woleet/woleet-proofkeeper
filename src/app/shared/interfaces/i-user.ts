export interface UserLog {
  id: string;
  created: number;
  type: LogType;
  status: number;
  method: string;
  url: string;
  message: string;
}

export enum LogType {
  API = 'API',
  CALLBACK = 'CALLBACK'
}