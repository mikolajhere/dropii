export interface Product {
  id?: string;
  disabled?: boolean;
  productTitle?: string;
  yourRetailPrice?: string;
  map?: string;
  shipping?: string;
  tax?: string;
  totalPrice?: string;
  discount?: string;
  retailerPrice?: string;
  profit?: string;
  image?: string;
}

interface ProductRow extends Product {
  position: number;
}

interface ProductGroup {
  id: string;
  position: number;
  products: ProductRow[];
}

export interface Groups {
  [key: string]: ProductGroup;
}
