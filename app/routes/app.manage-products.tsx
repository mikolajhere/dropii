import {
  Page,
  Layout,
  LegacyCard,
  IndexTable,
  Text,
  TextField,
  Button,
  Thumbnail,
} from "@shopify/polaris";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"; 
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import { TitleBar } from "@shopify/app-bridge-react";
import { Switch } from "@headlessui/react";
import { calculateValues } from "./hooks/calculate-values";
import { calculateTotalPrice } from "./hooks/calculate-total-price";
import { calculateRetailerPrice } from "./hooks/calculate-retailer-price";
import { calculateProfit } from "./hooks/calculate-profit";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const products = await admin.rest.resources.Product.all({ session: session });
  return json({ products });
};

export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const id = formData.get("id");
  const status = formData.get("status");
  // const map = formData.get("map");
  // const discount = formData.get("discount");
  if (typeof id !== "string" || typeof status !== "string") {
    return json({ message: "Invalid input" }, { status: 400 });
  }
  if (status) {
    const response = await admin.graphql(
      `#graphql mutation { productUpdate(input: {id: "gid://shopify/Product/${id}", status: ${status.toUpperCase()}}) { product { id } } }`,
    );
    const responseJson = await response.json();
    return json({ responseJson, message: "Success" });
  } 
  //  else if (map && discount) {
  //   // TODO Fix the map and discount update
  //   const response = await admin.graphql(
  //     `#graphql
  //     mutation {
  //       productUpdate(input: {id: "gid://shopify/Product/${id}", map: ${map}, discount: ${discount}}) {
  //         product {
  //           id
  //         }
  //       }
  //     }`,
  //   );
  //   const responseJson = await response.json();
  //   return json({ responseJson, message: "Success" });
  // }
}

export default function ManageProductsPage() {
  // TODO Fix variants map update
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const {
    products: { data: productData },
  } = useLoaderData<typeof loader>();
  const [globalMap, setGlobalMap] = useState<number>(0);
  const [globalShipping, setGlobalShipping] = useState<number>(10);
  const [globalDiscount, setGlobalDiscount] = useState<number>(25);
  const [state, setState] = useState(() =>
    productData.reduce((acc, product) => {
      const price = parseFloat(product.variants[0]?.price || "0.00");
      acc[product.id] = {
        map: price,
        shipping: globalShipping,
        discount: globalDiscount,
        totalPrice: calculateTotalPrice(price, globalShipping),
        retailerPrice: calculateRetailerPrice(price, globalDiscount),
        profit: calculateProfit(price, globalShipping, globalDiscount),
        enabled: product.status === "active",
        status: product.status,
      };
      product.variants.forEach((variant: any) => {
        const variantPrice = parseFloat(variant.price || "0.00");
        acc[`${product.id}-${variant.id}`] = {
          map: 2137,
          price: variantPrice,
          shipping: globalShipping,
          discount: globalDiscount,
          totalPrice: calculateTotalPrice(variantPrice, globalShipping),
          retailerPrice: calculateRetailerPrice(variantPrice, globalDiscount),
          profit: calculateProfit(variantPrice, globalShipping, globalDiscount),
          enabled: product.status === "active",
          status: product.status,
        };
      });
      return acc;
    }, {}),
  );

  // const shopify = useAppBridge();
  // const submit = useSubmit();

  useEffect(() => {
    // Handle global field updates
    const updatedState = { ...state };
    for (const key in updatedState) {
      const originalPrice = parseFloat(
        productData.find(
          (product) => product.id.toString() === key.split("-")[0],
        )?.variants[0]?.price || "0.00",
      );
      updatedState[key].map = originalPrice + (originalPrice * globalMap) / 100;
      updatedState[key].shipping = globalShipping;
      updatedState[key].discount = globalDiscount;
      const updatedValues = calculateValues(updatedState[key]);

      updatedState[key] = { ...updatedState[key], ...updatedValues };
    }
    setState(updatedState);
  }, [globalMap, globalShipping, globalDiscount]);

  const handleFieldChange =
    (id: string, field: string) => async (value: string) => {
      setState((prevState) => {
        // Update the specific field value
        const updatedFieldValue = value ? parseFloat(value) : 0;
        // Prepare the updated state
        const updatedState = {
          ...prevState,
          [id]: {
            ...prevState[id],
            [field]: updatedFieldValue,
          },
        };
        // Calculate the updated values
        const updatedValues = calculateValues(updatedState[id]);
        // Return the new state with updated values
        return {
          ...updatedState,
          [id]: {
            ...updatedState[id],
            ...updatedValues,
          },
        };
      });

      if (field === "map" || field === "discount") {
        // submit(
        //   { id: id.toString(), map: globalMap, discount: globalDiscount},
        //   { replace: true, method: "PUT" },
        // );
      }
    };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSwitchChange =
    (id: string | number) => async (value: boolean) => {
      setState((prevState) => {
        const updatedState = {
          ...prevState,
          [id]: {
            ...prevState[id],
            enabled: value,
            status: value ? "active" : "draft", // assuming 'active' and 'draft' are your statuses
          },
        };
        const product = productData.find(
          (p) => p.id.toString() === id.toString(),
        );
        if (product && product.variants.length > 1) {
          product.variants.forEach((variant: any) => {
            updatedState[`${id}-${variant.id}`].enabled = value;
          });
        }
        return updatedState;
      });

      // Submit the change to the backend
      // submit(
      //   { id: id.toString(), status: value ? "active" : "draft" },
      //   { replace: true, method: "PUT" },
      // );
    };

  const orders = productData.map((product) => ({
    id: product.id.toString(),
    productStatus: (
      <Switch
        checked={state[product.id]?.enabled || false}
        onChange={handleSwitchChange(product.id)}
        disabled={product.status === "archived"}
        className={`btn-switch group relative flex h-7 w-14 cursor-pointer rounded-full bg-white/10 p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white ${
          product.status === "archived"
            ? "disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
            : "data-[checked]:bg-white/10"
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-white ring-0 shadow-lg transition duration-200 ease-in-out group-data-[checked]:translate-x-7 ${
            state[product.id]?.enabled
              ? "group-data-[checked]:translate-x-7"
              : ""
          }`}
        />
      </Switch>
    ),
    productTitle: (
      <>
        {product.images.length > 0 ? (
          <span className="product-title">
            {product.image?.src ? (
              <Thumbnail
                source={product.image?.src}
                size="small"
                alt={product.title}
              />
            ) : (
              <Thumbnail
                source="/no-image.jpg"
                size="small"
                alt={product.title}
              />
            )}
            <span className="mr-auto">{product.title}</span>
            {product.variants.length > 1 &&
            product.id === product.variants[0].product_id ? (
              <Button
                textAlign="right"
                disclosure={expanded[product.id] ? "up" : "down"}
                onClick={() => toggleExpand(product.id.toString())}
              >
                Variants
              </Button>
            ) : null}
          </span>
        ) : (
          <span className="flex items-center gap-4">
            {product.image?.src ? (
              <Thumbnail
                source={product.image?.src}
                size="small"
                alt={product.title}
              />
            ) : (
              <Thumbnail
                source="/no-image.jpg"
                size="small"
                alt={product.title}
              />
            )}
            {product.title}
          </span>
        )}
      </>
    ),
    yourRetailPrice:
      product.variants.length > 1 ? (
        <span></span>
      ) : product.variants[0]?.price ? (
        `$${parseFloat(product.variants[0].price).toFixed(2)}`
      ) : (
        "$0.00"
      ),
    map:
      product.variants.length > 1 ? (
        <span></span>
      ) : (
        <TextField
          label=""
          autoComplete="off"
          value={state[product.id]?.map.toFixed(2) || ""}
          type="number"
          onChange={handleFieldChange(product.id, "map")}
        />
      ),
    shipping:
      product.variants.length > 1 ? (
        <span></span>
      ) : (
        <TextField
          label=""
          autoComplete="off"
          value={state[product.id]?.shipping || ""}
          type="number"
          onChange={handleFieldChange(product.id, "shipping")}
        />
      ),
    tax: product.variants.length > 1 ? <span></span> : "7%",
    totalPrice:
      product.variants.length > 1 ? (
        <span></span>
      ) : (
        `$${(state[product.id]?.totalPrice || 0).toFixed(2)}`
      ),
    discount:
      product.variants.length > 1 ? (
        <span></span>
      ) : (
        <TextField
          label=""
          autoComplete="off"
          value={state[product.id]?.discount || ""}
          type="number"
          onChange={handleFieldChange(product.id, "discount")}
        />
      ),
    RetailerPrice:
      product.variants.length > 1 ? (
        <span></span>
      ) : (
        `$${(state[product.id]?.retailerPrice || 0).toFixed(2)}`
      ),
    profit:
      product.variants.length > 1 ? (
        <span></span>
      ) : (
        <Text
          as="span"
          tone={state[product.id]?.profit < 0 ? "critical" : "success"}
        >
          {`$${(state[product.id]?.profit || 0).toFixed(2)}`}
        </Text>
      ),
    variants: product.variants,
  }));

  const rowMarkup = orders.map(
    (
      {
        id,
        productStatus,
        productTitle,
        yourRetailPrice,
        map,
        shipping,
        tax,
        totalPrice,
        discount,
        RetailerPrice,
        profit,
        variants,
      },
      index,
    ) => (
      <React.Fragment key={id}>
        <IndexTable.Row id={`${id}-main-row`} position={index}>
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {productStatus}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>{productTitle}</IndexTable.Cell>
          {variants.length <= 1 === true ? (
            <>
              <IndexTable.Cell>{yourRetailPrice}</IndexTable.Cell>
              <IndexTable.Cell>
                <Text as="span">{map}</Text>
              </IndexTable.Cell>
              <IndexTable.Cell>{shipping}</IndexTable.Cell>
              <IndexTable.Cell>{tax}</IndexTable.Cell>
              <IndexTable.Cell>{totalPrice}</IndexTable.Cell>
              <IndexTable.Cell>{discount}</IndexTable.Cell>
              <IndexTable.Cell>{RetailerPrice}</IndexTable.Cell>
              <IndexTable.Cell>
                <Text as="span" tone="success">
                  {profit}
                </Text>
              </IndexTable.Cell>
            </>
          ) : (
            <>
              <IndexTable.Cell>
                <Text as="span">&nbsp;</Text>
              </IndexTable.Cell>
              <IndexTable.Cell>
                <Text as="span">&nbsp;</Text>
              </IndexTable.Cell>
              <IndexTable.Cell>
                <Text as="span">&nbsp;</Text>
              </IndexTable.Cell>
              <IndexTable.Cell>
                <Text as="span">&nbsp;</Text>
              </IndexTable.Cell>
              <IndexTable.Cell>
                <Text as="span">&nbsp;</Text>
              </IndexTable.Cell>
              <IndexTable.Cell>
                <Text as="span">&nbsp;</Text>
              </IndexTable.Cell>
              <IndexTable.Cell>
                <Text as="span">&nbsp;</Text>
              </IndexTable.Cell>
              <IndexTable.Cell>
                <Text as="span">&nbsp;</Text>
              </IndexTable.Cell>
            </>
          )}
        </IndexTable.Row>
        {expanded[id] &&
          variants.map((variant: any, variantIndex: number) => (
            <IndexTable.Row
              key={variant.id}
              id={`${id}-${variant.id}-variant-row`}
              position={index + variantIndex + 1}
            >
              <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="bold" as="span">
                  &nbsp;
                </Text>
              </IndexTable.Cell>
              <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="bold" as="span">
                  <span className="product-variant-title">
                    {variant.image?.src ? (
                      <Thumbnail
                        source={variant.image?.src}
                        size="small"
                        alt={variant.title}
                      />
                    ) : (
                      <Thumbnail
                        source="/no-image.jpg"
                        size="small"
                        alt={variant.title}
                      />
                    )}
                    {variant.title}
                  </span>
                </Text>
              </IndexTable.Cell>
              <IndexTable.Cell>${variant.price}</IndexTable.Cell>
              <IndexTable.Cell>
                <TextField
                  label=""
                  autoComplete="off"
                  value={(state[`${id}-${variant.id}`]?.map || "").toFixed(2)}
                  type="number"
                  onChange={handleFieldChange(`${id}-${variant.id}`, "map")}
                />
              </IndexTable.Cell>
              <IndexTable.Cell>
                <TextField
                  label=""
                  autoComplete="off"
                  value={state[`${id}-${variant.id}`]?.shipping || ""}
                  type="number"
                  onChange={handleFieldChange(
                    `${id}-${variant.id}`,
                    "shipping",
                  )}
                />
              </IndexTable.Cell>
              <IndexTable.Cell>7%</IndexTable.Cell>
              <IndexTable.Cell>
                {`$${(state[`${id}-${variant.id}`]?.totalPrice || 0).toFixed(2)}`}
              </IndexTable.Cell>
              <IndexTable.Cell>
                <TextField
                  label=""
                  autoComplete="off"
                  value={state[`${id}-${variant.id}`]?.discount || ""}
                  type="number"
                  onChange={handleFieldChange(
                    `${id}-${variant.id}`,
                    "discount",
                  )}
                />
              </IndexTable.Cell>
              <IndexTable.Cell>
                {`$${(state[`${id}-${variant.id}`]?.retailerPrice || 0).toFixed(2)}`}
              </IndexTable.Cell>
              <IndexTable.Cell>
                <Text as="span" tone="success">
                  {`$${(state[`${id}-${variant.id}`]?.profit || 0).toFixed(2)}`}
                </Text>
              </IndexTable.Cell>
            </IndexTable.Row>
          ))}
      </React.Fragment>
    ),
  );

  return (
    <Page fullWidth>
      <TitleBar title="Manage Products"></TitleBar>
      <Layout>
        <Layout.Section>
          <LegacyCard>
            <IndexTable
              itemCount={orders.length}
              headings={[
                { id: "status", title: "Status" },
                { id: "title", title: "Product Title" },
                { id: "retailPrice", title: "Your Retail Price" },
                {
                  id: "map",
                  title: (
                    <span className="map-title">
                      MAP (+%)
                      <TextField
                        id="global-map-field"
                        label=""
                        autoComplete="off"
                        value={String(globalMap)}
                        type="number"
                        onChange={(e) => setGlobalMap(parseFloat(e))}
                      />
                    </span>
                  ),
                },
                {
                  id: "shipping",
                  title: (
                    <span className="shipping-title">
                      Shipping ($)
                      <TextField
                        id="shipping-map-field"
                        label=""
                        autoComplete="off"
                        value={String(globalShipping)}
                        type="number"
                        onChange={(e) => setGlobalShipping(parseFloat(e))}
                      />
                    </span>
                  ),
                },
                { id: "tax", title: "Tax" },
                { id: "totalPrice", title: "Total Price" },
                {
                  id: "discount",
                  title: (
                    <span className="discount-title">
                      Discount (%)
                      <TextField
                        id="discount-map-field"
                        label=""
                        autoComplete="off"
                        value={String(globalDiscount)}
                        type="number"
                        onChange={(e) => setGlobalDiscount(parseFloat(e))}
                      />
                    </span>
                  ),
                },
                { id: "retailerPrice", title: "Retailer Price" },
                { id: "profit", title: "Profit" },
              ]}
            >
              {rowMarkup}
            </IndexTable>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
