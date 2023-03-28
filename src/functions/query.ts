import createAPIGatewayProxyHandler from "samepage/backend/createAPIGatewayProxyHandler";

const logic = () => {
  console.log("query hit");
  return {
    uuid: {
      type: "string",
    },
  };
};

export default createAPIGatewayProxyHandler(logic);
