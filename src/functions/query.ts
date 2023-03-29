import createAPIGatewayProxyHandler from "samepage/backend/createAPIGatewayProxyHandler";
import zod from "../utils/zod";
// import apiClient from "samepage/internal/apiClient";

export const summary = "Fetch data shared to the SamePage Network";

const response = zod.object({
  data: zod
    .object({
      notebookUuid: zod.string(),
      results: zod
        .record(zod.string().or(zod.number()).or(zod.boolean()))
        .array(),
    })
    .array(),
});

type ZodResponse = zod.infer<typeof response>;

export const responses = [
  {
    schema: response,
    description: "The data shared to the SamePage Network",
    status: 200,
  },
];

export const request = zod.object({
  targets: zod
    .string()
    .array()
    .openapi({ description: "The notebook ids this query should target." }),
  conditions: zod
    .object({
      source: zod
        .string()
        .openapi({ description: "The source of the relation" }),
      target: zod
        .string()
        .openapi({ description: "The target of the relation" }),
      relation: zod
        .string()
        .openapi({ description: "The relationship of the condition" }),
    })
    .array()
    .openapi({
      description: "The conditions that muse be met to satisfy the query",
    }),
});

const logic = (data: zod.infer<typeof request>): ZodResponse => {
  return {
    data: data.targets.map((t) => ({
      notebookUuid: t,
      results: [],
    })),
  };
};

export default createAPIGatewayProxyHandler({ logic, bodySchema: request });
