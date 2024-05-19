export function calculateRetailerPrice(
  map: string | number,
  discount: string | number,
) {
  const validMap = parseFloat(map.toString()) || 0;
  const validDiscount = parseFloat(discount.toString()) || 0;
  const retailerPrice = validMap * ((100 - validDiscount) / 100);
  return retailerPrice;
}
