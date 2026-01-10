import { auth } from "@/auth";
import { getLinkedAccounts } from "@/lib/linkedAccounts";

export async function GET() {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await getLinkedAccounts();

  return Response.json({
    accounts,
  });
}
