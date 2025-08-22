import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { DBNeonConnect, Envs } from "../../";
import {
  PartyUserParamSchema,
  PartyUserQuerySchema,
} from "../../schemas-types/tbl-party-user";
import { all } from "./select";

export const createRPC = () => {
  const usersApp = new Hono<{ Bindings: Envs }>()
    .get(
      "/:userId",
      zValidator("param", PartyUserParamSchema),
      zValidator("query", PartyUserQuerySchema),
      async (c) => {
        try {
          const db = DBNeonConnect(c.env.DATABASE_URL);
          const param = c.req.valid("param");
          const query = c.req.valid("query");
          const data = await all(db, param, query);
          return c.json({ data, error: null }, 200);
        } catch (error) {
          return c.json({ data: null, error: "Error" }, 200);
        }
      }
    )
    .get("/:id", (c) => c.json({ result: `get ${c.req.param("id")}` }))
    .post("/", (c) => c.json({ result: "create an author" }, 201));

  const app = new Hono().route("/partyusers", usersApp);

  return app;
};

export type RPCRoutes = ReturnType<typeof createRPC>;
