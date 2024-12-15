import React from "react";
import { UserWallet } from "@/components/ui-components/user-profile";
import Logout from "@/components/ui-components/Logout";

const page = () => {
  return (
    <div className=" h-screen  flex justify-center items-center">
      <Logout />
      <UserWallet />
    </div>
  );
};

export default page;
