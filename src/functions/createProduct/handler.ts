import type { ValidatedEventAPIGatewayProxyEvent } from "../../libs/api-gateway";
import { formatJSONResponse } from "../../libs/api-gateway";
import { middyfy } from "../../libs/lambda";
import createError from "http-errors";
import { productService } from "../../services";
import { Product } from "../../services/product-service";
import schema from "./schema";
import { Stock } from "src/services/stock-service";

export const createProduct: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  try {
    const {title, description, count, price} = event.body
    const product = {title, description, price}
    const stock = { stock: count || 0}
    const result = await productService.createProduct(product as Product, stock as Stock);
    return formatJSONResponse({
      items: [result],
      statusCode: 201
    });
  } catch (err) {
    throw new createError.InternalServerError();
  }
};



export const main = middyfy(createProduct);
