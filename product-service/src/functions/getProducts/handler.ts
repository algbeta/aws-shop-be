import type { ValidatedEventAPIGatewayProxyEvent } from "../../libs/api-gateway";
import { formatJSONResponse } from "../../libs/api-gateway";
import { middyfy } from "../../libs/lambda";
import createError from "http-errors";
import { productService, stockService } from "../../services";
import { Product } from "../../services/product-service";
import schema from "./schema";
import { Stock } from "src/services/stock-service";

export const getProducts: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async () => {
  try {
    const products: Product[] = await productService.getProducts();
    const stocks: Stock[] = await stockService.getStocks();

    const items = products.map(product => {
      const stock: Stock = stocks.find(stock => stock.productId === product.id);
      return ({
        ...product,
        count: stock?.stock || 0,
      })
    })

    return formatJSONResponse({
      items,
    });
  } catch (err) {
    throw new createError.InternalServerError();
  }
};

export const main = middyfy(getProducts);
