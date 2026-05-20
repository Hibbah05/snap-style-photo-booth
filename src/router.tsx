import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// 1. Create a single client instance for your app
export const queryClient = new QueryClient();

// 2. Create and export the main router instance directly
export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});

// 3. Register the router for TypeScript safety across your project
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}