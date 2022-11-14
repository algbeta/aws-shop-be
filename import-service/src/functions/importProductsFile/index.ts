import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "import",
        cors: true,
        authorizer: {
          arn: `arn:aws:lambda:eu-central-1:${process.env.ACCOUNT_URL}:function:authorization-service-dev-basicAuthorizer`,
          name: "basicAuthorizer",
          type: "token",
          resultTtlInSeconds: 0,
          identityValidationExpression: "^Basic [-0-9a-zA-Z._]*$",
        },
      },
    },
  ],
};
