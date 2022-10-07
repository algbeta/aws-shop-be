import products from '../mocks/products.json';

export type Product = {
    id: string;
    title: string;
    description: string;
    price: number;
}

export default class ProductService {
  private products: Array<Product> = [];
  constructor() {
    this.products = products;
  }

  getProduct(id: string): Product | undefined {
    return  this.products.find(item => item.id === id);
  }

  getProducts() : Array<Product> {
    return this.products;
  }
}