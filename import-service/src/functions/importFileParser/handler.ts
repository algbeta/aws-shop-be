import type { S3Event } from "aws-lambda";
import parse from 'csv-parser';
import { S3 } from "@aws-sdk/client-s3";

const s3 = new S3({
  region: "eu-central-1",
});

const importFileParser = async (
  event: S3Event
) => {
  const  { s3: { object, bucket } } = event.Records[0];
  const records = [];
  try {
    const stream = (await s3.getObject({
      Bucket: bucket.name,
      Key: object.key,
    })).Body;

    const parser = stream.pipe(parse());
    for await (const record of parser) {
      records.push(record);
    }

    console.log(records);

    const parsedKey = `parsed/${object.key.split('/')[1]}`;

    console.log(parsedKey);

    await s3.copyObject({
      Bucket: bucket.name,
      CopySource: `${bucket.name}/${object.key}`,
      Key: parsedKey
    }).then(() => {
      s3.deleteObject({
        Bucket: bucket.name,
        Key: object.key,
      })
    })
  } catch (error) {
    console.error('Error while downloading object from S3', error.message)
    throw error
  }
};

export const main = importFileParser;
