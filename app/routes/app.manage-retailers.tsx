import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const products = await admin.rest.resources.Product.all({
    session: session,
  });
  return json({ products });
};

export default function ManageRetailersPage() {
  // const { testReq } = useLoaderData<typeof loader>();

  const testReq = fetch("https://jsonplaceholder.typicode.com/todos")
    .then((response) => response.json())
    .then((json) => console.log(json));

  console.log({ testReq });

  return (
    <Page fullWidth title="Manage Retails">
      <Layout>
        <Layout.Section>
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eius,
            repellat? Modi voluptate doloribus tempore saepe sequi dolore sit id
            ad minima explicabo tenetur, illo, sapiente culpa suscipit
            reprehenderit commodi earum?
          </p>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
