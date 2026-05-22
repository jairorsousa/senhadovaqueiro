"use client";

import { LogOut } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@senha-do-vaqueiro/ui";
import { getAdminSession, logoutAdmin } from "../lib/admin-auth";

export function AdminLogoutButton() {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: ["admin-session"],
    queryFn: getAdminSession,
    retry: false
  });
  const logoutMutation = useMutation({
    mutationFn: logoutAdmin,
    onSettled: () => {
      queryClient.removeQueries({ queryKey: ["admin-session"] });
      window.location.href = "/admin";
    }
  });

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-48 truncate text-sm text-muted-foreground md:inline">
        {sessionQuery.data?.user.email}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => logoutMutation.mutate()}
        loading={logoutMutation.isPending}
      >
        <LogOut aria-hidden="true" className="h-4 w-4" />
        Sair
      </Button>
    </div>
  );
}
