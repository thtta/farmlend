export function SuccessResponse(message: string, data?: object, meta?: object) {
  return {
    success: true,
    message,
    data,
    meta,
  };
}
