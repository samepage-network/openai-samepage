import createAPIGatewayProxyHandler from "samepage/backend/createAPIGatewayProxyHandler";
import zod from "../utils/zod";
import requestStatuses from "../utils/requestStatuses";
import sendCrossNotebookRequest from "src/utils/sendCrossNotebookRequest";

export const summary = "Fetch data shared to the SamePage Network";

const notebookResults = zod
  .record(zod.string().or(zod.number()).or(zod.boolean()))
  .array();

const response = zod.object({
  data: zod
    .object({
      notebookUuid: zod.string(),
      results: notebookResults.or(requestStatuses),
    })
    .array(),
});

const notebookRequestResponse = zod
  .object({ results: notebookResults })
  .or(requestStatuses);

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
    requestId: string;
  }
): Promise<ZodResponse> => {
  const { label, targets, authorization, requestId, ...req } = r;
  const responseData = await sendCrossNotebookRequest<ZodResponseResults>({
    authorization,
    request: req,
    targets,
    label,
  });
  const data = Object.entries(responseData).map(([notebookUuid, data]) => ({
    notebookUuid,
    results: typeof data === "object" && data !== null ? data.results : data,
  }));
  return {
    data,
  };
};

export default createAPIGatewayProxyHandler({
  logic,
  bodySchema: request,
});
