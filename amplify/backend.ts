import { defineBackend } from "@aws-amplify/backend";
import { data } from "./data/resource";
import { auth } from "./auth/resource";

const backend = defineBackend({
  auth,
  data,
});

// Thêm HTTP Data Source trỏ đến Google Gemini thay vì Amazon Bedrock
const geminiDataSource = backend.data.resources.graphqlApi.addHttpDataSource(
  "geminiDS",
  "https://generativelanguage.googleapis.com"
);