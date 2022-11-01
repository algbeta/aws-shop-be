import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import * as config from '../../../config.json';
import schema from './schema';

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const client = new S3Client({
    region: 'eu-central-1'
  });
  const { name } = event.queryStringParameters;
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: `uploaded/${name}`,
  })

  const signedUrl = await getSignedUrl(client, command, { expiresIn: 10000});

  return formatJSONResponse({
    body: signedUrl,
    event,
  });
};

export const main = middyfy(importProductsFile);
