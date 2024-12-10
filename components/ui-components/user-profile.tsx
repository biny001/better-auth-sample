"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Briefcase } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import redirectLogin from "@/lib/actions";
interface UserProfileProps {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export function UserProfile({
  name,
  email,
  role,
  avatarUrl,
}: UserProfileProps) {
  const signout = async () => {
    await authClient.signOut();
    redirectLogin();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <CardTitle className="text-2xl">{name}</CardTitle>
          <Badge variant="secondary" className="w-fit mt-1">
            {role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span>{email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <span>{role}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={signout} variant="outline" className="w-full">
          Edit Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
