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
    return { author: null, isNew: true };
  }

  const author = await getMetaobjectByHandle(admin, "author", id);
  
  if (!author) {
    throw redirect("/app/authors");
  }

  return { author, isNew: false };
};

export const action = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const { id } = params;

  const name = formData.get("name");
  const bio = formData.get("bio");
  const handle = formData.get("handle") || name.toLowerCase().replace(/\s+/g, "-");

  if (!name || name.trim() === "") {
    return { errors: [{ field: ["name"], message: "Name is required" }] };
  }

  if (id === "new") {
    const result = await createMetaobject(
      admin,
      "author",
      handle,
      name,
      [
        { key: "name", value: name },
        { key: "bio", value: bio || "" },
      ]
    );

    if (result.metaobjectCreate.userErrors.length > 0) {
      return { errors: result.metaobjectCreate.userErrors };
    }

    throw redirect("/app/authors");
  }

  const result = await updateMetaobject(
    admin,
    "author",
    id,
    name,
    [
      { key: "name", value: name },
      { key: "bio", value: bio || "" },
    ]
  );

  if (result.metaobjectUpdate.userErrors.length > 0) {
    return { errors: result.metaobjectUpdate.userErrors };
  }

  throw redirect("/app/authors");
};

export default function AuthorEdit() {
  const { author, isNew } = useLoaderData();
  const navigate = useNavigate();
  const params = useParams();

  const nameField = author?.fields?.find((f) => f.key === "name");
  const bioField = author?.fields?.find((f) => f.key === "bio");

  return (
    <s-page heading={isNew ? "Create Author" : "Edit Author"}>
      <form method="post">
        <s-stack direction="block" gap="base">
          <s-text-field
            label="Name"
            name="name"
            defaultValue={nameField?.value || ""}
            required
            helpText="The author's full name"
          />
          
          <s-text-field
            label="Handle"
            name="handle"
            defaultValue={author?.handle || ""}
            helpText="Unique identifier (auto-generated from name if creating new)"
            disabled={!isNew}
            pattern="[a-z0-9-]+"
            title="Lowercase letters, numbers, and hyphens only"
          />
          
          <s-text-area
            label="Bio"
            name="bio"
            defaultValue={bioField?.value || ""}
            rows={5}
            helpText="A short biography or description of the author"
          />

          <s-stack direction="inline" gap="tight">
            <s-button variant="primary" type="submit">
              Save
            </s-button>
            <s-button 
              variant="secondary" 
              type="button"
              onClick={() => navigate("/app/authors")}
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
