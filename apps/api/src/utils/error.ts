// Error handler
export function createError(status: number, message: string) {
  const err = new Error();
  // @ts-ignore
  err.status = status;
  err.message = message;
  return err;
}
