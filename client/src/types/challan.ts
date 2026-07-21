export interface ChallanItem {
  id?: string;
  productId: string;
  productNameSnapshot?: string;
  skuSnapshot?: string;
  unitPriceSnapshot?: string | number;
  quantity: number;
}

export interface Challan {
  id: string;
  challanNumber: string;

  customer: {
    id: string;
    name: string;
    businessName: string;
  };

  totalQuantity: number;

  status:
    | "DRAFT"
    | "CONFIRMED"
    | "CANCELLED";

  createdAt: string;

  creator?: {
    id: string;
    name: string;
  };

  items?: ChallanItem[];
}