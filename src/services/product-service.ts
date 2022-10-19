import { DocumentClient, TransactWriteItem } from "aws-sdk/clients/dynamodb";
import * as uuid from "uuid";
import { Stock } from "./stock-service";
import { stockService } from ".";

export type Product = {
  id?: string;
  title: string;
  description: string;
  price: number;
};

export default class ProductService {
  private client: DocumentClient;
  private tableName: string = "products";

  constructor(client: DocumentClient) {
    this.client = client;
  }

  getCreateProductTranskItem = (product: Product): TransactWriteItem => {
    return {
      Put: {
        // @ts-ignore
        Item: {
          ...product,
        },
        TableName: this.tableName,
      },
    };
  };

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await this.client
      .get({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();

    return result.Item as Product;
  }

  async getProducts(): Promise<Product[]> {
    const result = await this.client
      .scan({
        TableName: this.tableName,
      })
      .promise();
    return result.Items as Product[];
  }

  async createProduct(product: Product, stock: Stock) {
    const productId = uuid.v4();
    const productTransactItem = this.getCreateProductTranskItem({...product, id: productId});
    const stockTransactItem = stockService.getCreateStockTranskItem({...stock, productId}); 
    
    await this.client
      .transactWrite({
        TransactItems: [productTransactItem, stockTransactItem]
      })
      .promise();

    return {...product, id: productId, count: stock.stock};
  }
}
