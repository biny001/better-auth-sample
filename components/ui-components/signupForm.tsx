"use client";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm() {
  const navigate = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [image, setImage] = useState<File | null>(null);
  const [loading, setloading] = useState(false);

  const signUp = async () => {
    try {
      setloading(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, error } = await authClient.signUp.email(
        {
          email,
          password,
          name,
        },
        {
          onRequest: (ctx) => {
            console.log(ctx);
          },
          onSuccess: () => {
            async function createStellarAccount() {
              const res = await fetch("/api/createAccount", { method: "PUT" });
              if (!res.ok) {
                throw new Error("Failed to create stellar account");
              }
              const data = await res.json();
              return data;
            }
            const newAccount = createStellarAccount();
            console.log(newAccount);
            navigate.push("/");
            console.log("account created successfully");
          },
          onError: (ctx) => {
            alert(ctx.error.message);
          },
        }
      );
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }
  };
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">SignUp</CardTitle>
        <CardDescription>
          Enter your email below to signUp to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">name</Label>
            <Input
              value={name}
              id="name"
              type="name"
              placeholder="John Doe"
              required
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              value={email}
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                Forgot your password?
              </Link>
            </div>
            <Input
              value={password}
              id="password"
              type="password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            disabled={loading}
            onClick={signUp}
            type="submit"
            className="w-full"
          >
            signUp
          </Button>
          <Button disabled={loading} variant="outline" className="w-full">
            signUp with Google
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Log In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
