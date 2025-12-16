/**
 * Test-only module that exports raw CRUD operations for testing the crud utility.
 * This bypasses auth and business logic to test the generic CRUD functionality.
 */
import schema from "./schema";
import { crud } from "./utils/crud";

export const {
  create,
  createMany,
  read,
  readMany,
  queryAdvanced,
  paginate,
  update,
  updateMany,
  destroy,
  destroyMany,
  count,
  exists,
  findOne,
  upsert,
  softDelete,
  restore,
} = crud(schema, "vehicles");
