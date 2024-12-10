import { redirect } from "next/navigation";

export default async function redirectLogin() {
  redirect("/login");
}
export async function redirectHome() {
  redirect("/");
}
