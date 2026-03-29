import { useLoaderData, useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../../shopify.server";
import { getMetaobjects, deleteMetaobject } from "../../models/metaobject.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const authors = await getMetaobjects(admin, "author");
  return { authors };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  
  if (formData.get("action") === "delete") {
    const handle = formData.get("handle");
    const result = await deleteMetaobject(admin, "author", handle);
    return result;
  }
  
  return { success: true };
};

export default function AuthorsIndex() {
  const { authors } = useLoaderData();
  const navigate = useNavigate();

  const handleDelete = (handle) => {
    if (window.confirm("Are you sure you want to delete this author?")) {
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
    <s-page heading="Authors">
      <s-button
        slot="primary-action"
        onClick={() => navigate("/app/authors/new")}
      >
        Add author
      </s-button>

      {authors.edges.length === 0 ? (
        <s-section>
          <s-paragraph>
            No authors found. Create your first author to get started.
          </s-paragraph>
        </s-section>
      ) : (
        <>
          <s-section>
            <s-paragraph emphasis="subdued">
              {authors.edges.length} author{authors.edges.length !== 1 ? "s" : ""}
            </s-paragraph>
          </s-section>

          <s-section>
            <s-table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Bio</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {authors.edges.map(({ node }) => {
                  const nameField = node.fields.find((f) => f.key === "name");
                  const bioField = node.fields.find((f) => f.key === "bio");
                  
                  return (
                    <tr key={node.id}>
                      <td>
                        <s-text fontWeight="bold">
                          {nameField?.value || "Unnamed"}
                        </s-text>
                        <s-text size="small" emphasis="subdued">
                          @{node.handle}
                        </s-text>
                      </td>
                      <td>
                        <s-text emphasis="subdued">
                          {bioField?.value?.substring(0, 50) || "-"}
                          {bioField?.value?.length > 50 ? "..." : ""}
                        </s-text>
                      </td>
                      <td>
                        <s-stack direction="inline" gap="tight">
                          <s-button
                            variant="secondary"
                            size="small"
                            onClick={() => navigate(`/app/authors/${node.handle}`)}
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

          {authors.pageInfo.hasNextPage && (
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
