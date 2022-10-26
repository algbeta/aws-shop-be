var products = require("../mocks/products.json");
var stocks = require("../mocks/stocks.json");

var AWS = require("aws-sdk");

var productsJson = products.map(({ id, title, description, price }) => ({
  PutRequest: {
    Item: {
      id: {
        S: id,
      },
      title: {
        S: title,
      },
      description: {
        S: description,
      },
      price: {
        N: price,
      },
    },
  },
}));

var stocksJson = stocks.map(({ id, productId, count }) => ({
  PutRequest: {
    Item: {
      id: {
        S: id,
      },
      productId: {
        S: productId,
      },
      stock: {
        N: count,
      },
    },
  },
}));

AWS.config.update({ region: "eu-central-1" });
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
var handler = function (err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data);
  }
};

ddb.batchWriteItem(
  {
    RequestItems: {
      products: [...productsJson],
    },
  },
  handler
);

ddb.batchWriteItem(
  {
    RequestItems: {
      stocks: [...stocksJson],
    },
  },
  handler
);
