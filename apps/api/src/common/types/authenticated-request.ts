import type { UserRole } from "@prisma/client";
import type { Request } from "express";

export type AdminPrincipal = {
  kind: "admin";
  id: string;
  role: Exclude<UserRole, "COWBOY">;
  email: string;
};

export type CowboyPrincipal = {
  kind: "cowboy";
  id: string;
  cpf: string;
  role: "COWBOY";
};

export type AuthPrincipal = AdminPrincipal | CowboyPrincipal;

export type AuthenticatedRequest = Request & {
  auth?: AuthPrincipal;
};
