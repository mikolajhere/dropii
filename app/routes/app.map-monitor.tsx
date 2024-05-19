import type { IndexTableProps, IndexTableRowProps } from "@shopify/polaris";
import {
  Page,
  Layout,
  Image,
  IndexTable,
  useBreakpoints,
  Text,
  useIndexResourceState,
} from "@shopify/polaris";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import { Fragment } from "react/jsx-runtime";
import type { Groups, Product } from "~/types/product";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const products = await admin.rest.resources.Product.all({
    session: session,
  });
  return json({ products });
};

export default function ManagePage() {
  const {
    products: { data: productData },
  } = useLoaderData<typeof loader>();
  console.log(productData);

  const rows: Product[] = [
    {
      id: "1",
      disabled: false,
      productTitle: "Red T-Shirt",
      yourRetailPrice: "$10.00",
      map: "$10.00",
      shipping: "$0.00",
      tax: "$0.00",
      totalPrice: "$10.00",
      discount: "$0.00",
      retailerPrice: "$10.00",
      profit: "$0.00",
      image:
        "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg",
    },
    {
      id: "2",
      disabled: false,
      productTitle: "Blue T-Shirt",
      yourRetailPrice: "$10.00",
      map: "$10.00",
      shipping: "$0.00",
      tax: "$0.00",
      totalPrice: "$10.00",
      discount: "$0.00",
      retailerPrice: "$10.00",
      profit: "$0.00",
      image:
        "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg",
    },
    {
      id: "3",
      disabled: false,
      productTitle: "Green T-Shirt",
      yourRetailPrice: "$10.00",
      map: "$10.00",
      shipping: "$0.00",
      tax: "$0.00",
      totalPrice: "$10.00",
      discount: "$0.00",
      retailerPrice: "$10.00",
      profit: "$0.00",
      image:
        "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg",
    },
    {
      id: "4",
      disabled: false,
      productTitle: "Yellow T-Shirt",
      yourRetailPrice: "$10.00",
      map: "$10.00",
      shipping: "$0.00",
      tax: "$0.00",
      totalPrice: "$10.00",
      discount: "$0.00",
      retailerPrice: "$10.00",
      profit: "$0.00",
      image:
        "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg",
    },
  ];

  const columnHeadings = [
    { title: "Product title", id: "column-header--size" },
    { title: "Your retail price", id: "column-header--size" },
    { title: "MAP", id: "column-header--size" },
    { title: "Shipping", id: "column-header--size" },
    { title: "Tax", id: "column-header--size" },
    { title: "Total price", id: "column-header--size" },
    { title: "Discount", id: "column-header--size" },
    { title: "Retailer price", id: "column-header--size" },
    { title: "Profit", id: "column-header--size" },
  ];

  const groupRowsByGroupKey = (
    groupKey: keyof Product,
    resolveId: (groupVal: string) => string,
  ) => {
    let position = -1;
    const groups: Groups = rows.reduce((groups: Groups, product: Product) => {
      const groupVal: string = product[groupKey] as string;
      if (!groups[groupVal]) {
        position += 1;

        groups[groupVal] = {
          position,
          products: [],
          id: resolveId(groupVal),
        };
      }
      groups[groupVal].products.push({
        ...product,
        position: position + 1,
      });

      position += 1;
      return groups;
    }, {});

    return groups;
  };

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(rows as unknown as { [key: string]: unknown }[], {
      resourceFilter: ({ disabled }) => !disabled,
    });

  const groupedProducts = groupRowsByGroupKey(
    "productTitle",
    (color) => `color--${color.toLowerCase()}`,
  );

  const rowMarkup = Object.keys(groupedProducts).map((color, index) => {
    const { products, position, id: productId } = groupedProducts[color];
    let selected: IndexTableRowProps["selected"] = false;

    const someProductsSelected = products.some(
      ({ id }) => id && selectedResources.includes(id),
    );

    const allProductsSelected = products.every(
      ({ id }) => id && selectedResources.includes(id),
    );

    if (allProductsSelected) {
      selected = true;
    } else if (someProductsSelected) {
      selected = "indeterminate";
    }

    const selectableRows = rows.filter(({ disabled }) => !disabled);
    const rowRange: IndexTableRowProps["selectionRange"] = [
      selectableRows.findIndex((row) => row.id === products[0].id),
      selectableRows.findIndex(
        (row) => row.id === products[products.length - 1].id,
      ),
    ];

    const disabled = products.every(({ disabled }) => disabled);

    return (
      <Fragment key={productId}>
        <IndexTable.Row
          rowType="data"
          selectionRange={rowRange}
          id={`Parent-${index}`}
          position={position}
          selected={selected}
          disabled={disabled}
          accessibilityLabel={`Select all products which have color ${color}`}
        >
          <IndexTable.Cell scope="col" id={productId}>
            <Text as="span" fontWeight="semibold">
              {color}
            </Text>
          </IndexTable.Cell> 
          <IndexTable.Cell scope="col" id={productId}>
            <Text as="span" fontWeight="semibold">
              test 2
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell scope="col" id={productId}>
            <Text as="span" fontWeight="semibold">
              test 3
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell scope="col" id={productId}>
            <Text as="span" fontWeight="semibold">
              test 4
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell scope="col" id={productId}>
            <Text as="span" fontWeight="semibold">
              test 2
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell scope="col" id={productId}>
            <Text as="span" fontWeight="semibold">
              test 2
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell scope="col" id={productId}>
            <Text as="span" fontWeight="semibold">
              test 2
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell scope="col" id={productId}>
            <Text as="span" fontWeight="semibold">
              test 2
            </Text>
          </IndexTable.Cell>
        </IndexTable.Row>
        {products.map(({ id, position, disabled }, rowIndex) => (
          <IndexTable.Row
            rowType="child"
            key={rowIndex}
            id={id ?? ""}
            position={position}
            selected={selectedResources.includes(id ?? "")}
            disabled={disabled}
          >
            <IndexTable.Cell
              scope="row"
              headers={`${columnHeadings[0].id} ${productId}`}
            >
              <Text variant="bodyMd" as="span">
                {id}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" numeric>
                {id}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" alignment="end" numeric>
                {id}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" alignment="end" numeric>
                {id}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" alignment="end" numeric>
                {id}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" alignment="end" numeric>
                {id}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" alignment="end" numeric>
                {id}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" alignment="end" numeric>
                {id}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" alignment="end" numeric>
                {id}
              </Text>
            </IndexTable.Cell>
          </IndexTable.Row>
        ))}
      </Fragment>
    );
  });

  return (
    <Page fullWidth title="Manage Products">
      <Layout>
        <Layout.Section>
          <IndexTable
            condensed={useBreakpoints().smDown}
            onSelectionChange={handleSelectionChange}
            selectedItemsCount={
              allResourcesSelected ? "All" : selectedResources.length
            }
            resourceName={resourceName}
            itemCount={rows.length}
            headings={columnHeadings as IndexTableProps["headings"]}
          >
            {rowMarkup}
          </IndexTable>
          <ul style={{ display: "none" }}>
            {productData.map((product: any) => (
              <li key={product.id}>
                {product?.images[0]?.src === true ? (
                  <Image
                    source={`${product?.images[0]?.src}`}
                    height={34}
                    alt={product.title}
                  />
                ) : (
                  <Image
                    source={product.image?.src}
                    height={34}
                    width={34}
                    style={{ backgroundColor: "black" }}
                    alt={product.title}
                  />
                )}
                <h2>{product.title}</h2>
                {product.variants.length > 1 && (
                  <ul>
                    {product.variants.map((variant: any) => (
                      <li key={variant.id}>
                        - {variant.title} (Price: ${variant.price})
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
