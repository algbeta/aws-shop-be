import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import createError from "http-errors";
import { productService } from "../../services";
import schema from "./schema";


const getProductById: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  try {
    const {
      pathParameters: { id },
    } = event;
    const product = productService.getProduct(id);
    if (!product) {
      throw new createError.NotFound();
    }
    return formatJSONResponse({
      items: [product],
    });
  } catch (err) {
    throw new createError.InternalServerError();
  }
};

export const main = middyfy(getProductById);
