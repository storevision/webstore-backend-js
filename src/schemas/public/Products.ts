// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import type { CategoriesId } from './Categories';

/** Identifier type for public.products */
export type ProductsId = number & { __brand: 'ProductsId' };

/** Represents the table public.products */
export default interface Products {
  id: ProductsId;

  name: string;

  description: string;

  image_url: string;

  blurred_image: string | null;

  blurred_image_width: number | null;

  blurred_image_height: number | null;

  price_per_unit: number;

  category_id: CategoriesId | null;
}

/** Represents the initializer for the table public.products */
export interface ProductsInitializer {
  /** Default value: nextval('products_id_seq'::regclass) */
  id?: ProductsId;

  name: string;

  description: string;

  image_url: string;

  blurred_image?: string | null;

  blurred_image_width?: number | null;

  blurred_image_height?: number | null;

  price_per_unit: number;

  category_id?: CategoriesId | null;
}

/** Represents the mutator for the table public.products */
export interface ProductsMutator {
  id?: ProductsId;

  name?: string;

  description?: string;

  image_url?: string;

  blurred_image?: string | null;

  blurred_image_width?: number | null;

  blurred_image_height?: number | null;

  price_per_unit?: number;

  category_id?: CategoriesId | null;
}
