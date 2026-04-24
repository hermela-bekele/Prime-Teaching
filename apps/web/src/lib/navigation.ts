import type { Route } from "next";

/** Typed routes helper — dynamic paths from role logic. */
export function asAppRoute(path: string): Route {
  return path as Route;
}
