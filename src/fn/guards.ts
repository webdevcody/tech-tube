import { redirect } from "@tanstack/react-router";
import { getWebRequest } from "@tanstack/react-start/server";
import { auth } from "~/utils/auth";

// TODO: this guard seems broken, we need to fix.
export const assertAuthenticatedFn = (path: string) => async () => {
  const request = getWebRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    throw redirect({ to: path });
  }
};
