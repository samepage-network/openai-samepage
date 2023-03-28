import createAPIGatewayProxyHandler from "samepage/backend/createAPIGatewayProxyHandler";
import zod from "../utils/zod";

export const summaary = "Fetch data shared to the SamePage Network";

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
  targets: zod.string().array(),
  conditions: zod
    .object({
      source: zod.string(),
      target: zod.string(),
      relation: zod.string(),
    })
    .array(),
});

const logic = (req: unknown): ZodResponse => {
  const data = request.parse(req);
  return {
    data: data.targets.map((t) => ({
      notebookUuid: t,
      results: [],
    })),
  };
};

export default createAPIGatewayProxyHandler(logic);
