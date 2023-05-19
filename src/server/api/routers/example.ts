import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

const helloInputSchema = z.object({ message: z.string() });

type HelloInput = z.infer<typeof helloInputSchema>;

export const exampleRouter = createTRPCRouter({
  createThing: publicProcedure
    .input(z.object({ foo: z.string() }))
    .mutation(async ({ input, ctx }) => {
      console.log("clicked button");
      return "asdf";
    }),
  hello: publicProcedure.input(helloInputSchema).query(({ input, ctx }) => {
    return {
      greetingsssssss: `Hello ${input.message}`,
    };
  }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany({
      select: {
        id: true,
      },
      where: {
        id: "asdf",
      },
    });
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
