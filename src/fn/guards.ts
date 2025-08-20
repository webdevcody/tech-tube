import { redirect } from "@tanstack/react-router";
import { auth } from "~/utils/auth";

export const assertAuthenticatedFn =
  (path: string) => async (headers: Headers) => {
    const session = await auth.api.getSession({ headers });
    if (!session) {
      throw redirect({ to: path });
    }
  };
