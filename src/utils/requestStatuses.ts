import zod from "./zod";

const requestStatuses = zod
  .null()
  .openapi({
    description:
      "The request has been sent to the notebook and we are now waiting for the notebook to accept or reject the request. It cannot answer right now due to being offline.",
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

export default requestStatuses;
