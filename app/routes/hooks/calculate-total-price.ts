export function calculateTotalPrice(
  map: string | number,
  shipping: string | number,
) {
  const validMap = parseFloat(map.toString()) || 0;
  const validShipping = parseFloat(shipping.toString()) || 0;
  const totalPrice = (validMap + validShipping) * 1.07;
  return totalPrice;
}
