import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import createError from "http-errors";
import { productService } from "../../services";
import { Product } from "../../services/product-service";
import schema from "./schema";

const getProducts: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async () => {
  try {
    const products: Array<Product> = productService.getProducts();
    return formatJSONResponse({
      items: products,
    });
  } catch (err) {
    throw new createError.InternalServerError();
  }
};

export const main = middyfy(getProducts);
