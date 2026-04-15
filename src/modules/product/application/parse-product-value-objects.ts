import { BadRequestException } from '@nestjs/common';
import {
  Barcode,
  InvalidBarcodeError,
} from '../domain/value-objects/barcode.vo';
import {
  DiscountPercent,
  InvalidDiscountPercentError,
} from '../domain/value-objects/discountPercent.vo';
import {
  InvalidOriginalPriceError,
  OriginalPrice,
} from '../domain/value-objects/originalPrice.vo';
import { InvalidPriceError, Price } from '../domain/value-objects/price.vo';
import {
  InvalidProductNameError,
  ProductName,
} from '../domain/value-objects/productName.vo';
import { InvalidSkuError, Sku } from '../domain/value-objects/sku.vo';
import { InvalidSlugError, Slug } from '../domain/value-objects/slug.vo';
import { InvalidStockError, Stock } from '../domain/value-objects/stock.vo';

export function parseProductName(raw: string): ProductName {
  try {
    return ProductName.create(raw);
  } catch (e) {
    if (e instanceof InvalidProductNameError) {
      throw new BadRequestException(e.message);
    }
    throw e;
  }
}

export function parseBarcode(raw: string): Barcode {
  try {
    return Barcode.create(raw);
  } catch (e) {
    if (e instanceof InvalidBarcodeError) {
      throw new BadRequestException(e.message);
    }
    throw e;
  }
}

export function parseSlug(raw: string): Slug {
  try {
    return Slug.create(raw);
  } catch (e) {
    if (e instanceof InvalidSlugError) {
      throw new BadRequestException(e.message);
    }
    throw e;
  }
}

export function parseSku(raw: string): Sku {
  try {
    return Sku.create(raw);
  } catch (e) {
    if (e instanceof InvalidSkuError) {
      throw new BadRequestException(e.message);
    }
    throw e;
  }
}

export function parsePrice(raw: number): Price {
  try {
    return Price.create(raw);
  } catch (e) {
    if (e instanceof InvalidPriceError) {
      throw new BadRequestException(e.message);
    }
    throw e;
  }
}

export function parseOriginalPrice(raw: number): OriginalPrice {
  try {
    return OriginalPrice.create(raw);
  } catch (e) {
    if (e instanceof InvalidOriginalPriceError) {
      throw new BadRequestException(e.message);
    }
    throw e;
  }
}

export function parseStock(available: number, reserved = 0): Stock {
  try {
    return Stock.create(available, reserved);
  } catch (e) {
    if (e instanceof InvalidStockError) {
      throw new BadRequestException(e.message);
    }
    throw e;
  }
}

export function parseDiscountPercent(raw: number): DiscountPercent {
  try {
    return DiscountPercent.create(raw);
  } catch (e) {
    if (e instanceof InvalidDiscountPercentError) {
      throw new BadRequestException(e.message);
    }
    throw e;
  }
}
