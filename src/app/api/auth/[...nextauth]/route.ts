import { handlers } from "@/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  // Use default NextAuth handler for all requests
  return handlers.GET(req, context);
}

export const { POST } = handlers;
