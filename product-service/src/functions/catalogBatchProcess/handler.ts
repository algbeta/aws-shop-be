import createError from "http-errors";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { productService } from "../../services";
import { Product } from "../../services/product-service";
import { Stock } from "../../services/stock-service";

const snsClient = new SNSClient({
  region: 'eu-central-1'
})

export const catalogBatchProcess = async (event) => {
  try {
    const { Records } = event;
    console.log('event triggered; Records received: ');
    console.log(Records);

    Records.map(async (record) => {
      const recordBody = JSON.parse(record.body);
      const {title, description, price, count} = recordBody;
      const product = { title, description, price: parseInt(price) };
      const stock = { stock: parseInt(count) || 0 };
      await productService.createProduct(
        product as Product,
        stock as Stock
      );
    });
    console.log('attempt to publish records to the sns queue');
    await snsClient.send(new PublishCommand({
      Message: `The following products were successfully added to db: ${JSON.stringify(Records)}`,
      TopicArn: process.env.SNS_ARN,
      MessageAttributes: {
        total: {
          DataType: 'Number',
          StringValue: Records.length,
        }
      }
    }));
    console.log('sns queue publish completed');
  } catch (err) {
    throw new createError.InternalServerError();
  }
};

export const main = catalogBatchProcess;
