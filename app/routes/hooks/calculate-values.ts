import { calculateProfit } from "./calculate-profit";
import { calculateRetailerPrice } from "./calculate-retailer-price";
import { calculateTotalPrice } from "./calculate-total-price";

export function calculateValues(state: {
  map: any;
  shipping: any;
  discount: any;
}) {
  const { map, shipping, discount } = state;

  console.log({ map, shipping, discount })

  // Calculate Total Price
  const totalPrice = calculateTotalPrice(map, shipping);

  // Calculate Retailer Price
  const retailerPrice = calculateRetailerPrice(map, discount);

  // Calculate Profit
  const profit = calculateProfit(map, shipping, discount);

  return { totalPrice, retailerPrice, profit };
}
