var AWS = require("aws-sdk");
// Set the AWS Region.
AWS.config.update({ region: "eu-central-1" });

// Create DynamoDB service object.
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

const params = {
    TableName: this.tableName,
    FilterExpression: "productId = :id",
    ExpressionAttributeValues: {
      ":id": { S: '901d5da5-bd2d-424f-99d6-3dea1f88d3c1' },
    },
  TableName: "stocks",
};

ddb.scan(params, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
      data.Items.forEach(function (element, index, array) {
        console.log(
        element
            )
      });
    }
  });
  