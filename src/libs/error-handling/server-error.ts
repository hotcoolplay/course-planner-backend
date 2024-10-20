export class ServerError extends Error {
  constructor(
    public name: string,
    public message: string,
    public HttpStatus: number = 500,
    public isFatal: boolean = false,
    public stackTrace?: unknown,
  ) {
    super(message);
  }
}
