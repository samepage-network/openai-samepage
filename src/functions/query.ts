import createAPIGatewayProxyHandler from "samepage/backend/createAPIGatewayProxyHandler";
import zod from "../utils/zod";
import apiClient from "samepage/internal/apiClient";

export const summary = "Fetch data shared to the SamePage Network";

const notebookResultStatuses = zod
  .null()
  .openapi({
    description:
      "The request has been sent to the notebook and we are now waiting for the notebook to accept or reject the request.",
  })
  .or(
    zod.literal("pending").openapi({
      description:
        "We are still waiting for the notebook to respond to this request for data.",
    })
  )
  .or(
    zod.literal("rejected").openapi({
      description: "The notebook has rejected this request for data.",
    })
  );

const notebookResults = zod
  .record(zod.string().or(zod.number()).or(zod.boolean()))
  .array();

const response = zod.object({
  data: zod
    .object({
      notebookUuid: zod.string(),
      results: notebookResults.or(notebookResultStatuses),
    })
    .array(),
});

const notebookRequestResponse = zod
  .object({ results: notebookResults })
  .or(notebookResultStatuses);

type ZodResponseResults = zod.infer<typeof notebookRequestResponse>;
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
  label: zod.string().openapi({
    description: "The human-readable label to assign to this query",
  }),
});

const logic = async (
  r: zod.infer<typeof request> & {
    authorization: string;
  }
): Promise<ZodResponse> => {
  const { label, targets, authorization, ...req } = r;
  const requestData = await apiClient<
    Record<string, ZodResponseResults>
  >({
    method: "notebook-request",
    request: req,
    targets,
    label,
    token: authorization.replace(/^Bearer /, ""),
    notebookUuid: "openai",
  });
  const data = Object.entries(requestData).map(([notebookUuid, data]) => ({
    notebookUuid,
    results: typeof data === "object" && data !== null ? data.results : data,
  }));
  return {
    data,
  };
};

export default createAPIGatewayProxyHandler({
  logic,
  bodySchema: request.and(zod.object({ authorization: zod.string() })),
});
