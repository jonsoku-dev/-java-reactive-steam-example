import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db-types.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      "mysql://quant_user:quant_password@localhost:3306/quant_db",
  },
});
