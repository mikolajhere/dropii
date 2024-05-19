import { calculateRetailerPrice } from "./calculate-retailer-price";
import { calculateTotalPrice } from "./calculate-total-price";

export function calculateProfit(map: number, shipping: number, discount: number) {
  const totalPrice = calculateTotalPrice(map, shipping);
  const retailerPrice = calculateRetailerPrice(map, discount);
  const profit = totalPrice - retailerPrice;
  return profit;
}
