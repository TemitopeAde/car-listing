import { ZodError } from "zod";
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function respond(run: () => Promise<unknown>, status = 200) {
  try {
    return Response.json(
      { success: true, data: await run() },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof ZodError)
      return Response.json(
        {
          success: false,
          error: {
            code: "VALIDATION",
            message: "Please check the submitted fields.",
            fields: error.flatten(),
          },
        },
        { status: 400 },
      );
    if (error instanceof AppError)
      return Response.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    console.error(
      "Car listing request failed",
      error instanceof Error ? error.name : "unknown",
    );
    return Response.json(
      {
        success: false,
        error: {
          code: "REQUEST_FAILED",
          message:
            "The request failed. Check Wix collection permissions and try again.",
        },
      },
      { status: 500 },
    );
  }
}
