interface IRequestTrace {
  method: string;
  url: string;
  body?: Document | BodyInit | null;
  headers?: {
    [key: string]: string | number
  };
  response?: any;
  status?: number;
  statusText?: string;
  readonly useFetch: boolean;
  error?: Error;
}

interface XMLHttpRequest {
  trace: IRequestTrace;
}
