import { getProducts } from "./handler";
import {
  createMockContext,
  createMockAPIGatewayEvent,
} from "@homeservenow/serverless-event-mocks";
import { formatJSONResponse } from "../../libs/api-gateway";

const product = {
  id: "1180ae05-acdc-4c68-a6ed-508358c932a5",
  title: "Island Oasis - Raspberry",
  description: "Strain of muscle, fascia and tendon of triceps, unsp arm",
  price: 49,
};

const context = createMockContext();
const event = createMockAPIGatewayEvent({
  path: "/path",
  httpMethod: "post",
  pathParameters: { id: product.id },
});

jest.mock("../../services", () => ({
  productService: {
    getProducts: () => {
      return [product];
    },
  },
}));

jest.mock("../../libs/lambda", () => ({
  middyfy: (value) => value,
}));

describe("getProductById tests", () => {
  test("should return existing product", async () => {
    const result = await getProducts(
      // @ts-ignore
      event,
      context,
      () => {}
    );
    expect(result).toEqual(
      formatJSONResponse({
        items: [product],
      })
    );
  });
});
