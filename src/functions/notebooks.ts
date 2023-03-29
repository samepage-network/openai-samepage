import zod from "../utils/zod";
import apiClient from "samepage/internal/apiClient";
import createAPIGatewayProxyHandler from "samepage/backend/createAPIGatewayProxyHandler";

const schema = zod.object({
  notebooks: zod
    .object({
      uuid: zod.string().openapi({ description: "The notebook's UUID" }),
      workspace: zod.string().openapi({
        description: "The name of the workspace this notebook represents.",
      }),
      appName: zod.string().openapi({
        description: "The name of the application this notebook is a part of.",
      }),
      email: zod.string().openapi({
        description: "The email address of the user who owns this notebook.",
      }),
    })
    .array()
    .openapi({ description: "Notebooks this account has access to." }),
});

export const responses = [
  {
    schema,
    description: "Page data in the SamePage AtJson format",
    status: 200,
  },
];

type ZodResponse = zod.infer<typeof schema>;

export const request = zod.object({});

const logic = async ({
  authorization,
}: {
  authorization: string;
}): Promise<ZodResponse> => {
  return apiClient<ZodResponse>({
    method: "list-recent-notebooks",
    token: authorization.replace(/^Bearer /, ""),
    notebookUuid: "openai",
  });
};

export default createAPIGatewayProxyHandler(logic);
