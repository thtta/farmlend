import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../entities/product.entity';
import { UpdateProductDto } from '../dto/update-product.dto';

export class ProductFactory {
  static create(data: CreateProductDto) {
    const product = new Product(data.category, data.variety, data.packaging);
    return product;
  }

  static update(product: Product, data: UpdateProductDto) {
    product.category = data.category;
    product.variety = data.variety;
    product.packaging = data.packaging;

    return product;
  }
}
