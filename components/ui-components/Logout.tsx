"use client";
import { authClient } from "@/lib/auth-client";
import { LogOut as LogUserOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
const Logout = () => {
  const router = useRouter();

  return (
    <div
      className=" absolute top-24 right-36
    "
    >
      <Button
        onClick={async () =>
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                router.push("/login"); // redirect to login page
              },
            },
          })
        }
      >
        <LogUserOut className="w-16 h-16" />
      </Button>
    </div>
  );
};

export default Logout;
