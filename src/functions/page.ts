import createAPIGatewayProxyHandler from "samepage/backend/createAPIGatewayProxyHandler";
import { zInitialSchema } from "samepage/internal/types";
import apiClient from "samepage/internal/apiClient";
import zod from "../utils/zod";
import requestStatuses from "../utils/requestStatuses";

const zResponseData = zInitialSchema.or(requestStatuses);

const response = zod.object({
  data: zResponseData,
});

export const responses = [
  {
    schema: response,
    description: "Page data in the SamePage AtJson format",
    status: 200,
  },
];

export const summary = "Get the content from a single page";

export const request = zod
  .object({
    notebookUuid: zod
      .string()
      .openapi({
        description: "The application to request. Must be in UUID format.",
      }),
    notebookPageId: zod
      .string()
      .openapi({ description: "The page from the application to request" }),
  })
  .openapi({
    description: "The application and the page from the application to request",
  });

const logic = async (
  data: zod.infer<typeof request> & { authorization: string }
): Promise<zod.infer<typeof response>> => {
  const { notebookPageId, notebookUuid, authorization = "" } = data;
  const responseData = await apiClient<
    Record<string, zod.infer<typeof zResponseData>>
  >({
    method: "notebook-request",
    request: { notebookPageId },
    targets: [notebookUuid],
    label: notebookPageId,
    token: authorization.replace(/^Bearer /, ""),
    notebookUuid: "openai",
  });
  return {
    data: responseData[notebookUuid],
  };
};

export default createAPIGatewayProxyHandler({ logic, bodySchema: request });
