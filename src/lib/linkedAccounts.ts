import { cookies } from "next/headers";

export interface LinkedAccount {
  provider: string;
  providerId: string;
  name: string;
  image?: string;
  accessToken?: string;
}

const LINKED_ACCOUNTS_COOKIE = "linked-accounts";

/**
 * Get all linked accounts from cookie
 */
export async function getLinkedAccounts(): Promise<LinkedAccount[]> {
  const cookieStore = await cookies();
  const accountsCookie = cookieStore.get(LINKED_ACCOUNTS_COOKIE);
  
  if (!accountsCookie) {
    return [];
  }
  
  try {
    return JSON.parse(accountsCookie.value);
  } catch (error) {
    console.error("Failed to parse linked accounts:", error);
    return [];
  }
}

/**
 * Add or update a linked account
 */
export async function addLinkedAccount(account: LinkedAccount): Promise<void> {
  const accounts = await getLinkedAccounts();
  
  // Check if account already exists (by provider and providerId)
  const existingIndex = accounts.findIndex(
    (a) => a.provider === account.provider && a.providerId === account.providerId
  );
  
  if (existingIndex >= 0) {
    // Update existing account
    accounts[existingIndex] = account;
  } else {
    // Add new account
    accounts.push(account);
  }
  
  const cookieStore = await cookies();
  cookieStore.set(LINKED_ACCOUNTS_COOKIE, JSON.stringify(accounts), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
}

/**
 * Remove a linked account
 */
export async function removeLinkedAccount(provider: string, providerId: string): Promise<void> {
  const accounts = await getLinkedAccounts();
  const filteredAccounts = accounts.filter(
    (a) => !(a.provider === provider && a.providerId === providerId)
  );
  
  const cookieStore = await cookies();
  if (filteredAccounts.length > 0) {
    cookieStore.set(LINKED_ACCOUNTS_COOKIE, JSON.stringify(filteredAccounts), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
  } else {
    // Remove cookie if no accounts left
    cookieStore.delete(LINKED_ACCOUNTS_COOKIE);
  }
}
