import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import inputOutputLogger from '@middy/input-output-logger';
import pino from 'pino';

const logger = pino();
 
export const middyfy = (handler) => {
  return middy(handler)
    .use(middyJsonBodyParser())
    .use(httpErrorHandler())
    .use(inputOutputLogger({
      logger: (request) => {
        const child = logger.child(request.context)
        child.info(request.event ?? request.response)
      },
      awsContext: true
    }));
};
