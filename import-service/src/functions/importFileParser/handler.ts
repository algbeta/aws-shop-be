import type { S3Event } from "aws-lambda";
import parse from "csv-parser";
import { CORSConfigurationFilterSensitiveLog, S3 } from "@aws-sdk/client-s3";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const REGION = "eu-central-1";

const s3 = new S3({
  region: REGION,
});

const sqsClient = new SQSClient({ region: REGION });

const importFileParser = async (event: S3Event) => {
  const {
    s3: { object, bucket },
  } = event.Records[0];
  const records = [];
  try {
    const stream = (
      await s3.getObject({
        Bucket: bucket.name,
        Key: object.key,
      })
    ).Body;

    const parser = stream.pipe(parse());
    for await (const record of parser) {
      records.push(record);
    }

    console.log(records);

    const parsedKey = `parsed/${object.key.split("/")[1]}`;

    console.log(parsedKey);
    console.log("start sending messages to the queue");
    records.forEach(async (record) => {
      console.log('sending record:');
      console.log(JSON.stringify(record));
      const result = await sqsClient.send(
        new SendMessageCommand({
          QueueUrl:
            `https://sqs.eu-central-1.amazonaws.com/${process.env.QUEUE_ID}/catalogItemsQueue`,
          MessageBody: JSON.stringify(record),
        })
      );
      console.log('result');
      console.log(result);
    });
    console.log("complete sending messages to the queue");

    await s3
      .copyObject({
        Bucket: bucket.name,
        CopySource: `${bucket.name}/${object.key}`,
        Key: parsedKey,
      })
      .then(() => {
        s3.deleteObject({
          Bucket: bucket.name,
          Key: object.key,
        });
      });
  } catch (error) {
    console.error("Error while downloading object from S3", error.message);
    throw error;
  }
};

export const main = importFileParser;
