"use client";
import { authClient } from "@/lib/auth-client";

import React from "react";

const page = () => {
  const { data: session } = authClient.useSession();

  if (!session && session === null) {
    return <div>login to access page</div>;
  }

  return <div>page</div>;
};

export default page;
