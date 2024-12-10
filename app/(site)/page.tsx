import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserProfile } from "@/components/ui-components/user-profile";

const session = await auth.api.getSession({
  headers: await headers(),
});

const page = () => {
  if (session === null && !session) {
    return redirect("/login");
  }
  return (
    <div className=" h-screen  flex justify-center items-center">
      <UserProfile
        name="benji"
        email="benji@gmail.com"
        role="user"
        avatarUrl=""
      />
    </div>
  );
};

export default page;
