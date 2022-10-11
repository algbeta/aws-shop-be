import type { ValidatedEventAPIGatewayProxyEvent } from "../../libs/api-gateway";
import { formatJSONResponse } from "../../libs/api-gateway";
import { middyfy } from "../../libs/lambda";
import createError from "http-errors";
import { productService } from "../../services";
import schema from "./schema";

export const getProductById: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  const {
    pathParameters: { id },
  } = event;
  const product = productService.getProduct(id);
  if (!product) {
    throw new createError.NotFound("Product not found");
  }
  return formatJSONResponse({
    items: [product],
  });
};

export const main = middyfy(getProductById);
