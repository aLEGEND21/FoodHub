"use client";

import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 pt-6">
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <form action={logout}>
          <Button
            type="submit"
            variant="destructive"
            size="lg"
            className="gap-2"
          >
            <LogOut className="h-5 w-5" />
            Log Out
          </Button>
        </form>
      </div>
    </main>
  );
}
