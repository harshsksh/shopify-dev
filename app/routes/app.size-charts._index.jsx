import { useLoaderData, useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../../shopify.server";
import { getMetaobjects, deleteMetaobject } from "../../models/metaobject.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const sizeCharts = await getMetaobjects(admin, "size_chart");
  return { sizeCharts };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  if (formData.get("action") === "delete") {
    const handle = formData.get("handle");
    const result = await deleteMetaobject(admin, "size_chart", handle);
    return result;
  }

  return { success: true };
};

export default function SizeChartsIndex() {
  const { sizeCharts } = useLoaderData();
  const navigate = useNavigate();

  const handleDelete = (handle) => {
    if (window.confirm("Are you sure you want to delete this size chart?")) {
      const form = document.createElement("form");
      form.method = "post";
      form.innerHTML = `
        <input type="hidden" name="action" value="delete" />
        <input type="hidden" name="handle" value="${handle}" />
      `;
      document.body.appendChild(form);
      form.submit();
    }
  };

  return (
    <s-page heading="Size Charts">
      <s-button
        slot="primary-action"
        onClick={() => navigate("/app/size-charts/new")}
      >
        Add size chart
      </s-button>

      {sizeCharts.edges.length === 0 ? (
        <s-section>
          <s-paragraph>
            No size charts found. Create your first size chart to get started.
          </s-paragraph>
        </s-section>
      ) : (
        <>
          <s-section>
            <s-paragraph emphasis="subdued">
              {sizeCharts.edges.length} size chart{sizeCharts.edges.length !== 1 ? "s" : ""}
            </s-paragraph>
          </s-section>

          <s-section>
            <s-table>
              <thead>
                <tr>
                  <th>Chart Name</th>
                  <th>Handle</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sizeCharts.edges.map(({ node }) => {
                  const nameField = node.fields.find((f) => f.key === "chart_name");
                  const chartDataField = node.fields.find((f) => f.key === "chart_data");

                  return (
                    <tr key={node.id}>
                      <td>
                        <s-text fontWeight="bold">
                          {nameField?.value || "Unnamed"}
                        </s-text>
                      </td>
                      <td>
                        <s-text size="small" emphasis="subdued">
                          @{node.handle}
                        </s-text>
                      </td>
                      <td>
                        <s-text emphasis="subdued">
                          {chartDataField?.value ? "Has data" : "-"}
                        </s-text>
                      </td>
                      <td>
                        <s-stack direction="inline" gap="tight">
                          <s-button
                            variant="secondary"
                            size="small"
                            onClick={() => navigate(`/app/size-charts/${node.handle}`)}
                          >
                            Edit
                          </s-button>
                          <s-button
                            variant="plain"
                            size="small"
                            destructive
                            onClick={() => handleDelete(node.handle)}
                          >
                            Delete
                          </s-button>
                        </s-stack>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </s-table>
          </s-section>

          {sizeCharts.pageInfo.hasNextPage && (
            <s-section>
              <s-button
                variant="secondary"
                onClick={() => {
                  const url = new URL(window.location.href);
                  // Pagination would go here
                }}
              >
                Load more
              </s-button>
            </s-section>
          )}
        </>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
