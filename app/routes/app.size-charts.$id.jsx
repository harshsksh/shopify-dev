import { redirect } from "react-router";
import { useLoaderData, useNavigate, useParams } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../../shopify.server";
import {
  getMetaobjectByHandle,
  createMetaobject,
  updateMetaobject
} from "../../models/metaobject.server";

export const loader = async ({ params, request }) => {
  const { admin } = await authenticate.admin(request);
  const { id } = params;

  if (id === "new") {
    return { sizeChart: null, isNew: true };
  }

  const sizeChart = await getMetaobjectByHandle(admin, "size_chart", id);

  if (!sizeChart) {
    throw redirect("/app/size-charts");
  }

  return { sizeChart, isNew: false };
};

export const action = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const { id } = params;

  const chartName = formData.get("chart_name");
  const chartData = formData.get("chart_data");
  const handle = formData.get("handle") || chartName.toLowerCase().replace(/\s+/g, "-");

  if (!chartName || chartName.trim() === "") {
    return { errors: [{ field: ["chart_name"], message: "Chart name is required" }] };
  }

  // Validate JSON if provided
  let parsedChartData = null;
  if (chartData && chartData.trim() !== "") {
    try {
      parsedChartData = JSON.parse(chartData);
    } catch (e) {
      return { errors: [{ field: ["chart_data"], message: "Chart data must be valid JSON" }] };
    }
  }

  if (id === "new") {
    const result = await createMetaobject(
      admin,
      "size_chart",
      handle,
      chartName,
      [
        { key: "chart_name", value: chartName },
        { key: "chart_data", value: JSON.stringify(parsedChartData || {}) },
      ]
    );

    if (result.metaobjectCreate.userErrors.length > 0) {
      return { errors: result.metaobjectCreate.userErrors };
    }

    throw redirect("/app/size-charts");
  }

  const result = await updateMetaobject(
    admin,
    "size_chart",
    id,
    chartName,
    [
      { key: "chart_name", value: chartName },
      { key: "chart_data", value: JSON.stringify(parsedChartData || {}) },
    ]
  );

  if (result.metaobjectUpdate.userErrors.length > 0) {
    return { errors: result.metaobjectUpdate.userErrors };
  }

  throw redirect("/app/size-charts");
};

export default function SizeChartEdit() {
  const { sizeChart, isNew } = useLoaderData();
  const navigate = useNavigate();
  const params = useParams();

  const nameField = sizeChart?.fields?.find((f) => f.key === "chart_name");
  const dataField = sizeChart?.fields?.find((f) => f.key === "chart_data");

  // Format JSON for display
  const formatJson = (jsonString) => {
    if (!jsonString) return "";
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch {
      return jsonString;
    }
  };

  return (
    <s-page heading={isNew ? "Create Size Chart" : "Edit Size Chart"}>
      <form method="post">
        <s-stack direction="block" gap="base">
          <s-text-field
            label="Chart Name"
            name="chart_name"
            defaultValue={nameField?.value || ""}
            required
            helpText="e.g., T-Shirt Sizing, Pants Measurements"
          />

          <s-text-field
            label="Handle"
            name="handle"
            defaultValue={sizeChart?.handle || ""}
            helpText="Unique identifier (auto-generated from name if creating new)"
            disabled={!isNew}
            pattern="[a-z0-9-]+"
            title="Lowercase letters, numbers, and hyphens only"
          />

          <s-text-area
            label="Chart Data (JSON)"
            name="chart_data"
            defaultValue={formatJson(dataField?.value)}
            rows={10}
            helpText={
              <span>
                Enter size chart data as JSON. Example:{" "}
                <code>
                  {`{"sizes": [{"label": "S", "chest": "34-36", "waist": "28-30"}, {"label": "M", "chest": "38-40", "waist": "32-34"}]}`}
                </code>
              </span>
            }
            monospace
          />

          <s-section heading="Preview">
            <s-paragraph emphasis="subdued">
              The chart data will be stored as JSON and can be displayed in your theme using Liquid or JavaScript.
            </s-paragraph>
          </s-section>

          <s-stack direction="inline" gap="tight">
            <s-button variant="primary" type="submit">
              Save
            </s-button>
            <s-button
              variant="secondary"
              type="button"
              onClick={() => navigate("/app/size-charts")}
            >
              Cancel
            </s-button>
          </s-stack>
        </s-stack>
      </form>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
