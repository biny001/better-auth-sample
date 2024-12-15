import { auth } from "./auth"; // path to your Better Auth server instance
import { headers } from "next/headers";

export default async function getSession() {
  try {
    // Fetch headers
    const requestHeaders = headers();

    // Get session from the Better Auth server
    const session = await auth.api.getSession({
      headers: await requestHeaders, // Pass headers to the auth server
    });

    return session; // Return the session
  } catch (error) {
    console.error("Error fetching session:", error);
    return null; // Return null if session fetch fails
  }
}
