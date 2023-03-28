import createAPIGatewayProxyHandler from "samepage/backend/createAPIGatewayProxyHandler";

const logic = () => {
  console.log("page hit");
  return {
    content: "A quick brown fox jumped over the lazy dog.",
    annotations: [{ type: "italics", start: 2, end: 7 }],
  };
};

export default createAPIGatewayProxyHandler(logic);
