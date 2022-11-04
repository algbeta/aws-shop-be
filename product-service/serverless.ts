import type { AWS } from "@serverless/typescript";

import getProductById from "@functions/getProductById";
import getProducts from "@functions/getProducts";
import createProduct from "@functions/createProduct";
import catalogBatchProcess from "@functions/catalogBatchProcess";

const localDynamoDBResources = {
  products: {
    Type: "AWS::DynamoDB::Table",
    Properties: {
      TableName: "products",
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
      ],
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    },
  },
  stocks: {
    Type: "AWS::DynamoDB::Table",
    Properties: {
      TableName: "stocks",
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
      ],
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    },
  },
};

const Queues = {
  SQSQueue: {
    Type: "AWS::SQS::Queue",
    Properties: {
      QueueName: "catalogItemsQueue",
    },
  },
  SNSTopic: {
    Type: "AWS::SNS::Topic",
    Properties: {
      TopicName: "catalogItemsTopic",
    },
  },
  SNSSubscription: {
    Type: "AWS::SNS::Subscription",
    Properties: {
      Endpoint: "gorbunovano@gmail.com",
      Protocol: "email",
      TopicArn: {
        Ref: "SNSTopic",
      },
      FilterPolicy: {
        total: [{ numeric: ["=", 5] }],
      },
    },
  },
  SNSSubscription2: {
    Type: "AWS::SNS::Subscription",
    Properties: {
      Endpoint: "natallia_gorbunova@epam.com",
      Protocol: "email",
      TopicArn: {
        Ref: "SNSTopic",
      },
      FilterPolicy: {
        total: [{ "anything-but": [5] }],
      },
    },
  },
};

const resources = false
  ? { Resources: { ...localDynamoDBResources, ...Queues } }
  : { Resources: Queues };

const serverlessConfiguration: AWS = {
  service: "aws-shop-be",
  frameworkVersion: "3",
  plugins: [
    "serverless-esbuild",
    "serverless-offline",
    "serverless-dynamodb-local",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "eu-central-1",
    deploymentMethod: "direct",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      SQS_URL: {
        Ref: "SQSQueue",
      },
      SNS_ARN: {
        Ref: "SNSTopic",
      },
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:DeleteItem",
            ],
            Resource: `arn:aws:dynamodb:eu-central-1:${process.env.BD_ID}:table/products`,
          },
          {
            Effect: "Allow",
            Action: [
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:DeleteItem",
            ],
            Resource: `arn:aws:dynamodb:eu-central-1:${process.env.BD_ID}:table/stocks`,
          },
          {
            Effect: "Allow",
            Action: ["sns:*"],
            Resource: {
              Ref: "SNSTopic",
            },
          },
        ],
      },
    },
  },
  functions: {
    getProductById,
    getProducts,
    createProduct,
    catalogBatchProcess,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    offline: {
      port: 3002,
    },
    dynamodb: {
      start: {
        port: 5000,
        inMemory: true,
        migrate: true,
      },
      stages: "dev",
    },
  },
  resources,
  useDotenv: true,
};

module.exports = serverlessConfiguration;
