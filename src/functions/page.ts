import createAPIGatewayProxyHandler from "samepage/backend/createAPIGatewayProxyHandler";
import { InitialSchema, zInitialSchema } from "samepage/internal/types";
import zod from "../utils/zod";

export const responses = [
  {
    schema: zInitialSchema,
    description: "Page data in the SamePage AtJson format",
    status: 200,
  },
];

export const summary = "Get the content from a single page";

export const request = zod
  .object({
    notebookUuid: zod
      .string()
      .openapi({ description: "The application to request" }),
    notebookPageId: zod
      .string()
      .openapi({ description: "The page from the application to request" }),
  })
  .openapi({
    description: "The application and the page from the application to request",
  });

const logic = (data: zod.infer<typeof request>): InitialSchema => {
  return {
    content: `A quick brown fox jumped over the lazy dog (${data.notebookPageId})`,
    annotations: [{ type: "italics", start: 2, end: 7 }],
  };
};

export default createAPIGatewayProxyHandler({ logic, bodySchema: request });
