import ProductService from "./product-service";

import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import StocktService from "./stock-service";

const createDynamoDBClient = (): DocumentClient => {
  if (process.env.IS_OFFLINE) {
    return new AWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:5000",
    });
  }

  return new AWS.DynamoDB.DocumentClient();
};

const client = createDynamoDBClient();

const productService = new ProductService(client);
const stockService = new StocktService(client);
export { productService, stockService }