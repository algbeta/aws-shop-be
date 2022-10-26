import type { ValidatedEventAPIGatewayProxyEvent } from "../../libs/api-gateway";
import { formatJSONResponse } from "../../libs/api-gateway";
import { middyfy } from "../../libs/lambda";
import createError from "http-errors";
import { productService, stockService } from "../../services";
import schema from "./schema";
import { Stock } from "src/services/stock-service";
import { Product } from "src/services/product-service";

export const getProductById: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  try {
    const {
      pathParameters: { id },
    } = event;
    const product: Product = await productService.getProduct(id);
    const stocks: Stock[] = await stockService.getStockByProductId(id);
    if (!product) {
      return formatJSONResponse({
        statusCode: 404,
        message: "Product not found",
      });
    }
    return formatJSONResponse({
      // @ts-ignore
      items: [{ ...product, count: stocks?.length > 0 ? stocks[0].stock : 0 }],
    });
  } catch (e) {
    throw new createError.InternalServerError();
  }
};

export const main = middyfy(getProductById);
