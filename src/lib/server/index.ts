import { eventsRouter } from "./routers/events";
import { usersRouter } from "./routers/users";
import { router } from "./trpc";

export const appRouter = router({
  ...eventsRouter,
  ...usersRouter,
});

export type AppRouter = typeof appRouter;
