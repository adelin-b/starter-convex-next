import { convexTest } from "convex-test";
import { beforeEach, describe, expect, test } from "vitest";
import { internal } from "./_generated/api";
import type { Doc as Document, Id } from "./_generated/dataModel";
import schema from "./schema";
import { modules } from "./test.setup";

/** Vehicle input type without system fields */
type VehicleInput = Omit<Document<"vehicles">, "_id" | "_creationTime"> & {
  _id?: Id<"vehicles">;
  _creationTime?: number;
};

describe("vehicles CRUD operations", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  // Test sample data matching Vehicles schema
  const sampleVehicle = {
    make: "Toyota",
    model: "Camry",
    description: "A reliable sedan",
    year: 2023,
    price: 28_000,
    mileage: 15_000,
    fuelType: "gasoline" as const,
    licensePlate: "ABC123",
    status: "available" as const,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const sampleVehicles = [
    {
      make: "Honda",
      model: "Civic",
      year: 2022,
      price: 24_000,
      mileage: 20_000,
      fuelType: "gasoline" as const,
      licensePlate: "DEF456",
      status: "available" as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      make: "Tesla",
      model: "Model 3",
      year: 2024,
      price: 45_000,
      mileage: 5000,
      fuelType: "electric" as const,
      licensePlate: "GHI789",
      status: "sold" as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  // Helper functions using the CRUD operations via API
  const createVehicle = (vehicle: VehicleInput) =>
    t.mutation(internal.testVehiclesCrud.create, vehicle);

  const createVehicles = (vehicles: VehicleInput[]) =>
    t.mutation(internal.testVehiclesCrud.createMany, { items: vehicles });

  const readVehicle = (id: Id<"vehicles">) => t.query(internal.testVehiclesCrud.read, { id });

  const readVehicles = (ids: Id<"vehicles">[]) =>
    t.query(internal.testVehiclesCrud.readMany, { ids });

  test("create operations", async () => {
    // Create single vehicle
    const createdVehicle = await createVehicle(sampleVehicle);
    expect(createdVehicle).toMatchObject({
      make: sampleVehicle.make,
      model: sampleVehicle.model,
      year: sampleVehicle.year,
    });
    expect(createdVehicle?._id).toBeDefined();
    expect(createdVehicle?._creationTime).toBeDefined();

    // Create multiple vehicles
    const createdVehicles = await createVehicles(sampleVehicles);
    expect(createdVehicles).toHaveLength(2);
    for (const [index, vehicle] of createdVehicles.entries()) {
      expect(vehicle.make).toBe(sampleVehicles[index].make);
      expect(vehicle._id).toBeDefined();
    }
  });

  test("read operations", async () => {
    // Read single vehicle by ID
    const vehicle = await createVehicle(sampleVehicle);
    const retrieved = await readVehicle(vehicle!._id);
    expect(retrieved).toMatchObject({
      make: sampleVehicle.make,
      model: sampleVehicle.model,
    });

    // Read multiple vehicles by IDs
    const vehicles = await createVehicles(sampleVehicles);
    const vehicleIds = vehicles.map((v) => v._id);
    const retrievedVehicles = await readVehicles(vehicleIds);

    expect(retrievedVehicles).toHaveLength(2);
    for (const [index, v] of retrievedVehicles.entries()) {
      expect(v.make).toBe(sampleVehicles[index].make);
    }
  });

  test("readMany with by_status index", async () => {
    // Create vehicles with mixed statuses
    const mixedVehicles = [
      {
        ...sampleVehicle,
        make: "BMW",
        licensePlate: "BMW001",
        status: "available" as const,
      },
      {
        ...sampleVehicle,
        make: "Audi",
        licensePlate: "AUD001",
        status: "sold" as const,
      },
      {
        ...sampleVehicle,
        make: "Mercedes",
        licensePlate: "MER001",
        status: "available" as const,
      },
      {
        ...sampleVehicle,
        make: "Porsche",
        licensePlate: "POR001",
        status: "reserved" as const,
      },
    ];

    await createVehicles(mixedVehicles);

    // Query available vehicles using by_status index
    const availableVehicles = await t.query(internal.testVehiclesCrud.readMany, {
      filter: {
        indexName: "by_status",
        indexValue: "available",
      },
    });

    // Check that we only get available vehicles
    expect(availableVehicles.length).toBeGreaterThan(0);
    for (const vehicle of availableVehicles) {
      expect(vehicle.status).toBe("available");
    }

    // Query sold vehicles
    const soldVehicles = await t.query(internal.testVehiclesCrud.readMany, {
      filter: {
        indexName: "by_status",
        indexValue: "sold",
      },
    });

    expect(soldVehicles.length).toBeGreaterThan(0);
    for (const vehicle of soldVehicles) {
      expect(vehicle.status).toBe("sold");
    }
  });

  test("readMany with by_make index", async () => {
    // Create vehicles with different makes
    const toyotaVehicles = [
      {
        ...sampleVehicle,
        make: "Toyota",
        model: "Camry",
        licensePlate: "TOY001",
      },
      {
        ...sampleVehicle,
        make: "Toyota",
        model: "Corolla",
        licensePlate: "TOY002",
      },
      {
        ...sampleVehicle,
        make: "Honda",
        model: "Accord",
        licensePlate: "HON001",
      },
    ];

    await createVehicles(toyotaVehicles);

    // Query Toyota vehicles using by_make index
    const toyotas = await t.query(internal.testVehiclesCrud.readMany, {
      filter: {
        indexName: "by_make",
        indexValue: "Toyota",
      },
    });

    expect(toyotas.length).toBe(2);
    for (const vehicle of toyotas) {
      expect(vehicle.make).toBe("Toyota");
    }
  });

  test("readMany with limit parameter", async () => {
    // Create multiple vehicles
    const manyVehicles = Array.from({ length: 5 }, (_, index) => ({
      ...sampleVehicle,
      make: "TestMake",
      model: `Model${index}`,
      licensePlate: `TEST00${index}`,
    }));

    await createVehicles(manyVehicles);

    // Query with limit
    const limitedResults = await t.query(internal.testVehiclesCrud.readMany, {
      filter: {
        indexName: "by_make",
        indexValue: "TestMake",
      },
      limit: 3,
    });

    expect(limitedResults).toHaveLength(3);
  });

  test("pagination", async () => {
    // Create vehicles
    const vehicles = [
      { ...sampleVehicle, licensePlate: "PAG001" },
      { ...sampleVehicle, licensePlate: "PAG002" },
      { ...sampleVehicle, licensePlate: "PAG003" },
    ];

    await createVehicles(vehicles);

    // Test pagination - first page
    const result = await t.query(internal.testVehiclesCrud.paginate, {
      paginationOpts: { numItems: 2, cursor: null },
    });

    expect(result.page).toHaveLength(2);
    expect(result.isDone).toBe(false);

    // Get second page - with 3 items and page size 2, second page should have exactly 1 item
    const secondPage = await t.query(internal.testVehiclesCrud.paginate, {
      paginationOpts: { numItems: 2, cursor: result.continueCursor },
    });

    expect(secondPage.page).toHaveLength(1);
    expect(secondPage.isDone).toBe(true);
  });

  test("update operations", async () => {
    // Single update
    const vehicle = await createVehicle(sampleVehicle);
    await t.mutation(internal.testVehiclesCrud.update, {
      id: vehicle!._id,
      patch: { price: 30_000, status: "reserved" },
    });

    const updated = await readVehicle(vehicle!._id);
    expect(updated?.price).toBe(30_000);
    expect(updated?.status).toBe("reserved");

    // Multiple updates
    const vehicles = await createVehicles(sampleVehicles);
    await t.mutation(internal.testVehiclesCrud.updateMany, {
      items: [
        { id: vehicles[0]._id, patch: { status: "sold" } },
        { id: vehicles[1]._id, patch: { price: 50_000 } },
      ],
    });

    const [vehicle1, vehicle2] = await Promise.all([
      readVehicle(vehicles[0]._id),
      readVehicle(vehicles[1]._id),
    ]);

    expect(vehicle1?.status).toBe("sold");
    expect(vehicle2?.price).toBe(50_000);
  });

  test("delete operations", async () => {
    // Single delete
    const vehicle = await createVehicle(sampleVehicle);
    const deleted = await t.mutation(internal.testVehiclesCrud.destroy, {
      id: vehicle!._id,
    });

    expect(deleted).toMatchObject({
      make: sampleVehicle.make,
      model: sampleVehicle.model,
    });
    expect(await readVehicle(vehicle!._id)).toBeNull();

    // Multiple deletes
    const vehicles = await createVehicles(sampleVehicles);
    const vehicleIds = vehicles.map((v) => v._id);

    const deletedVehicles = await t.mutation(internal.testVehiclesCrud.destroyMany, {
      ids: vehicleIds,
    });

    expect(deletedVehicles).toHaveLength(2);
    for (const id of vehicleIds) {
      expect(await readVehicle(id)).toBeNull();
    }
  });

  test("read returns null for non-existent ID", async () => {
    // Create and delete a vehicle to get a valid but non-existent ID format
    const vehicle = await createVehicle(sampleVehicle);
    await t.mutation(internal.testVehiclesCrud.destroy, { id: vehicle!._id });

    const result = await readVehicle(vehicle!._id);
    expect(result).toBeNull();
  });

  test("readMany with empty ids array returns all documents (falls through to default path)", async () => {
    // Create some vehicles first to verify behavior
    await createVehicles([
      { ...sampleVehicle, licensePlate: "EMPTY01" },
      { ...sampleVehicle, licensePlate: "EMPTY02" },
    ]);

    // Empty ids array falls through to "return all documents" path
    // because `args.ids.length > 0` is false
    const result = await t.query(internal.testVehiclesCrud.readMany, { ids: [] });

    // Should return ALL documents, not empty array
    expect(result).toHaveLength(2);
    expect(result.some((v) => v.licensePlate === "EMPTY01")).toBe(true);
    expect(result.some((v) => v.licensePlate === "EMPTY02")).toBe(true);
  });

  test("destroy returns null for non-existent document", async () => {
    // Create and delete a vehicle to get a valid but non-existent ID
    const vehicle = await createVehicle(sampleVehicle);
    const vehicleId = vehicle!._id;

    // Delete it first
    await t.mutation(internal.testVehiclesCrud.destroy, { id: vehicleId });

    // Try to delete again
    const result = await t.mutation(internal.testVehiclesCrud.destroy, {
      id: vehicleId,
    });

    expect(result).toBeNull();
  });

  // ============================================
  // TDD: Critical Fixes
  // ============================================

  test("readMany without filter respects default limit", async () => {
    // Create more vehicles than default limit would allow
    const manyVehicles = Array.from({ length: 15 }, (_, index) => ({
      ...sampleVehicle,
      licensePlate: `LIMIT${String(index).padStart(3, "0")}`,
    }));

    await createVehicles(manyVehicles);

    // Query without filter - should respect limit parameter
    const result = await t.query(internal.testVehiclesCrud.readMany, {
      limit: 5,
    });

    expect(result).toHaveLength(5);
  });

  test("update returns updated document", async () => {
    const vehicle = await createVehicle(sampleVehicle);

    const updated = await t.mutation(internal.testVehiclesCrud.update, {
      id: vehicle!._id,
      patch: { price: 35_000, status: "reserved" },
    });

    // Should return the updated document, not void
    expect(updated).toBeDefined();
    expect(updated?.price).toBe(35_000);
    expect(updated?.status).toBe("reserved");
    expect(updated?.make).toBe(sampleVehicle.make);
  });

  // ============================================
  // TDD: Query Enhancements
  // ============================================

  test("count returns total document count", async () => {
    await createVehicles([
      { ...sampleVehicle, licensePlate: "CNT001" },
      { ...sampleVehicle, licensePlate: "CNT002" },
      { ...sampleVehicle, licensePlate: "CNT003" },
    ]);

    const count = await t.query(internal.testVehiclesCrud.count, {});

    expect(count).toBe(3);
  });

  test("count with filter returns filtered count", async () => {
    await createVehicles([
      { ...sampleVehicle, licensePlate: "CNT001", status: "available" as const },
      { ...sampleVehicle, licensePlate: "CNT002", status: "sold" as const },
      { ...sampleVehicle, licensePlate: "CNT003", status: "available" as const },
    ]);

    const availableCount = await t.query(internal.testVehiclesCrud.count, {
      filter: { indexName: "by_status", indexValue: "available" },
    });

    expect(availableCount).toBe(2);
  });

  test("exists returns true for existing document", async () => {
    const vehicle = await createVehicle(sampleVehicle);

    const exists = await t.query(internal.testVehiclesCrud.exists, {
      id: vehicle!._id,
    });

    expect(exists).toBe(true);
  });

  test("exists returns false for non-existent document", async () => {
    const vehicle = await createVehicle(sampleVehicle);
    await t.mutation(internal.testVehiclesCrud.destroy, { id: vehicle!._id });

    const exists = await t.query(internal.testVehiclesCrud.exists, {
      id: vehicle!._id,
    });

    expect(exists).toBe(false);
  });

  test("findOne returns first matching document", async () => {
    await createVehicles([
      { ...sampleVehicle, licensePlate: "FND001", status: "available" as const },
      { ...sampleVehicle, licensePlate: "FND002", status: "sold" as const },
    ]);

    const found = await t.query(internal.testVehiclesCrud.findOne, {
      filter: { indexName: "by_status", indexValue: "sold" },
    });

    expect(found).toBeDefined();
    expect(found?.status).toBe("sold");
    expect(found?.licensePlate).toBe("FND002");
  });

  test("findOne returns null when no match", async () => {
    await createVehicle({ ...sampleVehicle, status: "available" as const });

    const found = await t.query(internal.testVehiclesCrud.findOne, {
      filter: { indexName: "by_status", indexValue: "reserved" },
    });

    expect(found).toBeNull();
  });

  test("upsert creates document when not exists", async () => {
    const result = await t.mutation(internal.testVehiclesCrud.upsert, {
      filter: { indexName: "by_license_plate", indexValue: "UPS001" },
      create: { ...sampleVehicle, licensePlate: "UPS001" },
      update: { price: 99_000 },
    });

    expect(result.created).toBe(true);
    expect(result.document.licensePlate).toBe("UPS001");
    expect(result.document.price).toBe(sampleVehicle.price); // Uses create data
  });

  test("upsert updates document when exists", async () => {
    // Create existing vehicle
    await createVehicle({ ...sampleVehicle, licensePlate: "UPS002", price: 20_000 });

    const result = await t.mutation(internal.testVehiclesCrud.upsert, {
      filter: { indexName: "by_license_plate", indexValue: "UPS002" },
      create: { ...sampleVehicle, licensePlate: "UPS002" },
      update: { price: 99_000 },
    });

    expect(result.created).toBe(false);
    expect(result.document.price).toBe(99_000); // Uses update data
  });

  // ============================================
  // TDD: Soft Delete
  // ============================================

  test("softDelete sets deletedAt timestamp", async () => {
    const vehicle = await createVehicle(sampleVehicle);

    const deleted = await t.mutation(internal.testVehiclesCrud.softDelete, {
      id: vehicle!._id,
    });

    expect(deleted?.deletedAt).toBeDefined();
    expect(deleted?.deletedAt).toBeGreaterThan(0);
  });

  test("restore clears deletedAt timestamp", async () => {
    const vehicle = await createVehicle(sampleVehicle);
    await t.mutation(internal.testVehiclesCrud.softDelete, { id: vehicle!._id });

    const restored = await t.mutation(internal.testVehiclesCrud.restore, {
      id: vehicle!._id,
    });

    expect(restored?.deletedAt).toBeUndefined();
  });

  test("readMany excludes soft-deleted by default", async () => {
    const vehicles = await createVehicles([
      { ...sampleVehicle, licensePlate: "DEL001" },
      { ...sampleVehicle, licensePlate: "DEL002" },
    ]);

    // Soft delete one
    await t.mutation(internal.testVehiclesCrud.softDelete, { id: vehicles[0]._id });

    // Query all - should exclude soft-deleted
    const result = await t.query(internal.testVehiclesCrud.readMany, {});

    expect(result.every((v) => v.licensePlate !== "DEL001")).toBe(true);
    expect(result.some((v) => v.licensePlate === "DEL002")).toBe(true);
  });

  test("readMany with includeDeleted returns all", async () => {
    const vehicles = await createVehicles([
      { ...sampleVehicle, licensePlate: "DEL003" },
      { ...sampleVehicle, licensePlate: "DEL004" },
    ]);

    await t.mutation(internal.testVehiclesCrud.softDelete, { id: vehicles[0]._id });

    const result = await t.query(internal.testVehiclesCrud.readMany, {
      includeDeleted: true,
    });

    expect(result.some((v) => v.licensePlate === "DEL003")).toBe(true);
    expect(result.some((v) => v.licensePlate === "DEL004")).toBe(true);
  });

  // ============================================
  // Edge Cases: Critical Gaps (Rating 8-10)
  // ============================================

  test("softDelete returns null for non-existent document", async () => {
    // Create and hard-delete a vehicle to get a valid but non-existent ID
    const vehicle = await createVehicle(sampleVehicle);
    const vehicleId = vehicle!._id;
    await t.mutation(internal.testVehiclesCrud.destroy, { id: vehicleId });

    // Try to soft-delete non-existent document
    const result = await t.mutation(internal.testVehiclesCrud.softDelete, {
      id: vehicleId,
    });

    expect(result).toBeNull();
  });

  test("restore returns null for non-existent document", async () => {
    // Create and hard-delete a vehicle to get a valid but non-existent ID
    const vehicle = await createVehicle(sampleVehicle);
    const vehicleId = vehicle!._id;
    await t.mutation(internal.testVehiclesCrud.destroy, { id: vehicleId });

    // Try to restore non-existent document
    const result = await t.mutation(internal.testVehiclesCrud.restore, {
      id: vehicleId,
    });

    expect(result).toBeNull();
  });

  test("upsert creates even when filter value doesn't match anything", async () => {
    // Create an existing vehicle
    await createVehicle({ ...sampleVehicle, licensePlate: "EXISTING1" });

    // Upsert with filter that doesn't match any document - should create new
    const result = await t.mutation(internal.testVehiclesCrud.upsert, {
      filter: { indexName: "by_license_plate", indexValue: "NONEXISTENT" },
      create: { ...sampleVehicle, licensePlate: "UPSNEW1" },
      update: { price: 99_000 },
    });

    expect(result.created).toBe(true);
    expect(result.document.licensePlate).toBe("UPSNEW1");

    // Verify original still exists and new one was created
    const count = await t.query(internal.testVehiclesCrud.count, {});
    expect(count).toBe(2);
  });

  test("findOne returns null when filter matches nothing", async () => {
    // Create a vehicle to ensure table isn't empty
    await createVehicle({ ...sampleVehicle, licensePlate: "FINDNULL1" });

    // findOne with filter that doesn't match - returns null
    const result = await t.query(internal.testVehiclesCrud.findOne, {
      filter: { indexName: "by_license_plate", indexValue: "NONEXISTENT" },
    });

    expect(result).toBeNull();
  });

  // ============================================
  // Edge Cases: Important Gaps (Rating 5-7)
  // ============================================

  test("count returns 0 for empty table", async () => {
    // Don't create any vehicles - table should be empty
    const count = await t.query(internal.testVehiclesCrud.count, {});

    expect(count).toBe(0);
  });

  test("readMany with index filter excludes soft-deleted", async () => {
    // Create vehicles with same status
    const vehicles = await createVehicles([
      { ...sampleVehicle, licensePlate: "IDXDEL01", status: "available" as const },
      { ...sampleVehicle, licensePlate: "IDXDEL02", status: "available" as const },
      { ...sampleVehicle, licensePlate: "IDXDEL03", status: "sold" as const },
    ]);

    // Soft delete one available vehicle
    await t.mutation(internal.testVehiclesCrud.softDelete, { id: vehicles[0]._id });

    // Query by index - should exclude soft-deleted
    const available = await t.query(internal.testVehiclesCrud.readMany, {
      filter: { indexName: "by_status", indexValue: "available" },
    });

    expect(available).toHaveLength(1);
    expect(available[0].licensePlate).toBe("IDXDEL02");
  });

  test("readMany by IDs excludes soft-deleted", async () => {
    const vehicles = await createVehicles([
      { ...sampleVehicle, licensePlate: "IDDEL01" },
      { ...sampleVehicle, licensePlate: "IDDEL02" },
      { ...sampleVehicle, licensePlate: "IDDEL03" },
    ]);

    // Soft delete middle vehicle
    await t.mutation(internal.testVehiclesCrud.softDelete, { id: vehicles[1]._id });

    // Query by all IDs - should exclude soft-deleted
    const result = await t.query(internal.testVehiclesCrud.readMany, {
      ids: vehicles.map((v) => v._id),
    });

    expect(result).toHaveLength(2);
    expect(result.some((v) => v.licensePlate === "IDDEL01")).toBe(true);
    expect(result.some((v) => v.licensePlate === "IDDEL02")).toBe(false);
    expect(result.some((v) => v.licensePlate === "IDDEL03")).toBe(true);
  });

  test("destroyMany with partial existing IDs returns null for missing", async () => {
    // Create two vehicles
    const vehicles = await createVehicles([
      { ...sampleVehicle, licensePlate: "PARTDEL1" },
      { ...sampleVehicle, licensePlate: "PARTDEL2" },
    ]);

    // Delete one to make it non-existent
    await t.mutation(internal.testVehiclesCrud.destroy, { id: vehicles[0]._id });

    // Try to delete both (one exists, one doesn't)
    const results = await t.mutation(internal.testVehiclesCrud.destroyMany, {
      ids: [vehicles[0]._id, vehicles[1]._id],
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toBeNull(); // First one was already deleted
    expect(results[1]).not.toBeNull(); // Second one existed
    expect(results[1]?.licensePlate).toBe("PARTDEL2");
  });

  test("createMany with empty array returns empty array", async () => {
    const results = await t.mutation(internal.testVehiclesCrud.createMany, {
      items: [],
    });

    expect(results).toEqual([]);

    // Verify no documents were created
    const count = await t.query(internal.testVehiclesCrud.count, {});
    expect(count).toBe(0);
  });

  test("readMany by IDs with includeDeleted returns soft-deleted", async () => {
    const vehicles = await createVehicles([
      { ...sampleVehicle, licensePlate: "INCLDEL1" },
      { ...sampleVehicle, licensePlate: "INCLDEL2" },
    ]);

    // Soft delete one
    await t.mutation(internal.testVehiclesCrud.softDelete, { id: vehicles[0]._id });

    // Query by IDs with includeDeleted
    const result = await t.query(internal.testVehiclesCrud.readMany, {
      ids: vehicles.map((v) => v._id),
      includeDeleted: true,
    });

    expect(result).toHaveLength(2);
    expect(result.some((v) => v.licensePlate === "INCLDEL1")).toBe(true);
    expect(result.some((v) => v.licensePlate === "INCLDEL2")).toBe(true);
  });

  test("readMany with index filter and includeDeleted returns soft-deleted", async () => {
    const vehicles = await createVehicles([
      { ...sampleVehicle, licensePlate: "IDXINC1", status: "reserved" as const },
      { ...sampleVehicle, licensePlate: "IDXINC2", status: "reserved" as const },
    ]);

    // Soft delete one
    await t.mutation(internal.testVehiclesCrud.softDelete, { id: vehicles[0]._id });

    // Query by index with includeDeleted
    const result = await t.query(internal.testVehiclesCrud.readMany, {
      filter: { indexName: "by_status", indexValue: "reserved" },
      includeDeleted: true,
    });

    expect(result).toHaveLength(2);
    expect(result.some((v) => v.licensePlate === "IDXINC1")).toBe(true);
    expect(result.some((v) => v.licensePlate === "IDXINC2")).toBe(true);
  });

  // ============================================
  // Soft-delete consistency tests for count/exists
  // ============================================

  test("count excludes soft-deleted documents by default", async () => {
    await createVehicles([
      { ...sampleVehicle, licensePlate: "CNTBUG1" },
      { ...sampleVehicle, licensePlate: "CNTBUG2" },
      { ...sampleVehicle, licensePlate: "CNTBUG3" },
    ]);

    const vehicles = await t.query(internal.testVehiclesCrud.readMany, {});
    await t.mutation(internal.testVehiclesCrud.softDelete, { id: vehicles[0]._id });

    // readMany excludes soft-deleted by default
    const readManyResult = await t.query(internal.testVehiclesCrud.readMany, {});
    expect(readManyResult).toHaveLength(2);

    // count should also exclude soft-deleted by default
    const count = await t.query(internal.testVehiclesCrud.count, {});
    expect(count).toBe(2);

    // includeDeleted: true should count all
    const countAll = await t.query(internal.testVehiclesCrud.count, { includeDeleted: true });
    expect(countAll).toBe(3);
  });

  test("count with filter excludes soft-deleted documents", async () => {
    await createVehicles([
      { ...sampleVehicle, licensePlate: "CNTFLT1", status: "available" as const },
      { ...sampleVehicle, licensePlate: "CNTFLT2", status: "available" as const },
    ]);

    const vehicles = await t.query(internal.testVehiclesCrud.readMany, {
      filter: { indexName: "by_status", indexValue: "available" },
    });
    await t.mutation(internal.testVehiclesCrud.softDelete, { id: vehicles[0]._id });

    const count = await t.query(internal.testVehiclesCrud.count, {
      filter: { indexName: "by_status", indexValue: "available" },
    });
    expect(count).toBe(1);

    // includeDeleted: true with filter
    const countAll = await t.query(internal.testVehiclesCrud.count, {
      filter: { indexName: "by_status", indexValue: "available" },
      includeDeleted: true,
    });
    expect(countAll).toBe(2);
  });

  test("exists returns false for soft-deleted documents by default", async () => {
    const vehicle = await createVehicle(sampleVehicle);
    await t.mutation(internal.testVehiclesCrud.softDelete, { id: vehicle!._id });

    // readMany excludes it by default
    const readManyResult = await t.query(internal.testVehiclesCrud.readMany, {
      ids: [vehicle!._id],
    });
    expect(readManyResult).toHaveLength(0);

    // exists should return false for soft-deleted by default
    const exists = await t.query(internal.testVehiclesCrud.exists, {
      id: vehicle!._id,
    });
    expect(exists).toBe(false);

    // includeDeleted: true should return true
    const existsWithDeleted = await t.query(internal.testVehiclesCrud.exists, {
      id: vehicle!._id,
      includeDeleted: true,
    });
    expect(existsWithDeleted).toBe(true);
  });

  // ============================================
  // Additional Edge Case Tests
  // ============================================

  test("read returns null when no ID provided", async () => {
    // Create a vehicle to ensure it's not returning first doc
    await createVehicle(sampleVehicle);

    const result = await t.query(internal.testVehiclesCrud.read, {});
    expect(result).toBeNull();
  });

  test("findOne returns null when no filter provided", async () => {
    await createVehicle(sampleVehicle);

    // @ts-expect-error - Testing null filter behavior (runtime allows null, type is strict)
    const result = await t.query(internal.testVehiclesCrud.findOne, { filter: null });
    expect(result).toBeNull();
  });

  test("upsert with null filter always creates new document", async () => {
    // Create existing vehicle
    await createVehicle({ ...sampleVehicle, licensePlate: "UPSNULL1" });

    // Upsert with null filter - should always create, never update
    const result = await t.mutation(internal.testVehiclesCrud.upsert, {
      filter: null,
      create: { ...sampleVehicle, licensePlate: "UPSNULL2" },
      update: { price: 99_000 },
    });

    expect(result.created).toBe(true);
    expect(result.document.licensePlate).toBe("UPSNULL2");

    // Verify both exist
    const count = await t.query(internal.testVehiclesCrud.count, {});
    expect(count).toBe(2);
  });

  test("softDelete on already soft-deleted document updates timestamp", async () => {
    const vehicle = await createVehicle(sampleVehicle);
    const firstDelete = await t.mutation(internal.testVehiclesCrud.softDelete, {
      id: vehicle!._id,
    });
    const firstTimestamp = firstDelete!.deletedAt;

    // Wait a small amount to ensure different timestamp
    await new Promise((resolve) => setTimeout(resolve, 5));

    const secondDelete = await t.mutation(internal.testVehiclesCrud.softDelete, {
      id: vehicle!._id,
    });

    // Timestamp should be updated (idempotent but updates timestamp)
    expect(secondDelete?.deletedAt).toBeGreaterThanOrEqual(firstTimestamp!);
  });

  test("restore on non-soft-deleted document is a no-op", async () => {
    const vehicle = await createVehicle(sampleVehicle);

    // Restore a document that was never soft-deleted
    const restored = await t.mutation(internal.testVehiclesCrud.restore, {
      id: vehicle!._id,
    });

    expect(restored).toBeDefined();
    expect(restored?.deletedAt).toBeUndefined();
    expect(restored?.make).toBe(sampleVehicle.make);
  });

  test("update on non-existent document throws error", async () => {
    // Create and delete to get valid but non-existent ID
    const vehicle = await createVehicle(sampleVehicle);
    await t.mutation(internal.testVehiclesCrud.destroy, { id: vehicle!._id });

    // Convex db.patch throws when ID doesn't exist
    await expect(
      t.mutation(internal.testVehiclesCrud.update, {
        id: vehicle!._id,
        patch: { price: 99_000 },
      }),
    ).rejects.toThrow();
  });

  test("updateMany with non-existent ID throws error", async () => {
    const vehicles = await createVehicles([
      { ...sampleVehicle, licensePlate: "UPDMNY1" },
      { ...sampleVehicle, licensePlate: "UPDMNY2" },
    ]);

    // Delete one vehicle
    await t.mutation(internal.testVehiclesCrud.destroy, { id: vehicles[0]._id });

    // Try to update both - should throw because first ID doesn't exist
    await expect(
      t.mutation(internal.testVehiclesCrud.updateMany, {
        items: [
          { id: vehicles[0]._id, patch: { price: 10_000 } },
          { id: vehicles[1]._id, patch: { price: 20_000 } },
        ],
      }),
    ).rejects.toThrow();
  });

  test("destroyMany returns results in same order as input IDs", async () => {
    const vehicles = await createVehicles([
      { ...sampleVehicle, licensePlate: "ORD001" },
      { ...sampleVehicle, licensePlate: "ORD002" },
      { ...sampleVehicle, licensePlate: "ORD003" },
    ]);

    // Reverse order to verify ordering is maintained
    const reversedIds = [vehicles[2]._id, vehicles[1]._id, vehicles[0]._id];
    const results = await t.mutation(internal.testVehiclesCrud.destroyMany, {
      ids: reversedIds,
    });

    expect(results).toHaveLength(3);
    expect(results[0]?.licensePlate).toBe("ORD003");
    expect(results[1]?.licensePlate).toBe("ORD002");
    expect(results[2]?.licensePlate).toBe("ORD001");
  });

  // ============================================
  // TDD: Advanced Filtering - queryAdvanced
  // ============================================

  describe("queryAdvanced - type-aware filtering", () => {
    // Setup diverse test data
    const advancedTestVehicles = [
      {
        ...sampleVehicle,
        make: "Toyota",
        model: "Camry",
        licensePlate: "ADV001",
        year: 2020,
        price: 25_000,
        mileage: 50_000,
        status: "available" as const,
        createdAt: Date.now() - 86_400_000 * 30, // 30 days ago
        updatedAt: Date.now() - 86_400_000 * 30,
      },
      {
        ...sampleVehicle,
        make: "Toyota",
        model: "Corolla",
        licensePlate: "ADV002",
        year: 2022,
        price: 22_000,
        mileage: 30_000,
        status: "available" as const,
        createdAt: Date.now() - 86_400_000 * 15, // 15 days ago
        updatedAt: Date.now() - 86_400_000 * 15,
      },
      {
        ...sampleVehicle,
        make: "Honda",
        model: "Accord",
        licensePlate: "ADV003",
        year: 2023,
        price: 35_000,
        mileage: 10_000,
        status: "sold" as const,
        createdAt: Date.now() - 86_400_000 * 7, // 7 days ago
        updatedAt: Date.now() - 86_400_000 * 7,
      },
      {
        ...sampleVehicle,
        make: "BMW",
        model: "X5",
        licensePlate: "ADV004",
        year: 2024,
        price: 75_000,
        mileage: 5000,
        status: "reserved" as const,
        createdAt: Date.now() - 86_400_000 * 2, // 2 days ago
        updatedAt: Date.now() - 86_400_000 * 2,
      },
    ];

    test("number filter: price between range (gte + lte)", async () => {
      await createVehicles(advancedTestVehicles);

      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [
            { field: "price", operator: "gte", value: 20_000 },
            { field: "price", operator: "lte", value: 40_000 },
          ],
        },
      });
      expect(results.length).toBeGreaterThan(0);
      for (const v of results) {
        expect(v.price).toBeGreaterThanOrEqual(20_000);
        expect(v.price).toBeLessThanOrEqual(40_000);
      }
    });

    test("number filter: year greater than", async () => {
      await createVehicles(advancedTestVehicles);

      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [{ field: "year", operator: "gt", value: 2021 }],
        },
      });
      expect(results.length).toBeGreaterThan(0);
      for (const v of results) {
        expect(v.year).toBeGreaterThan(2021);
      }
    });

    test("string filter: contains (case-insensitive)", async () => {
      await createVehicles(advancedTestVehicles);

      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [{ field: "make", operator: "contains", value: "toy" }],
        },
      });
      expect(results.length).toBe(2); // Toyota Camry and Corolla
      for (const v of results) {
        expect(v.make?.toLowerCase()).toContain("toy");
      }
    });

    test("array filter: status in multiple values", async () => {
      await createVehicles(advancedTestVehicles);

      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [{ field: "status", operator: "in", value: ["available", "reserved"] }],
        },
      });
      expect(results.length).toBe(3); // 2 available + 1 reserved
      for (const v of results) {
        expect(["available", "reserved"]).toContain(v.status);
      }
    });

    test("combined: index filter + post-filter", async () => {
      await createVehicles(advancedTestVehicles);

      // Use index for status, then post-filter for price
      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          indexName: "by_status",
          indexConditions: [{ field: "status", operator: "eq", value: "available" }],
          postFilters: [{ field: "price", operator: "lt", value: 25_000 }],
        },
      });
      expect(results.length).toBe(1); // Only Corolla (22k)
      expect(results[0].make).toBe("Toyota");
      expect(results[0].model).toBe("Corolla");
    });

    test("ordering: desc by creation time", async () => {
      await createVehicles(advancedTestVehicles);

      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        order: { direction: "desc" },
        limit: 4,
      });
      // Most recent should be first (BMW, created 2 days ago)
      expect(results[0].make).toBe("BMW");
    });

    test("neq filter: exclude specific value", async () => {
      await createVehicles(advancedTestVehicles);

      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [{ field: "status", operator: "neq", value: "sold" }],
        },
      });
      expect(results.length).toBe(3); // available(2) + reserved(1)
      for (const v of results) {
        expect(v.status).not.toBe("sold");
      }
    });

    test("complex: multiple conditions combined", async () => {
      await createVehicles(advancedTestVehicles);

      // Available vehicles, year >= 2022, price < 30000
      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          indexName: "by_status",
          indexConditions: [{ field: "status", operator: "eq", value: "available" }],
          postFilters: [
            { field: "year", operator: "gte", value: 2022 },
            { field: "price", operator: "lt", value: 30_000 },
          ],
        },
      });
      expect(results.length).toBe(1);
      expect(results[0].model).toBe("Corolla");
    });

    // ============================================
    // Date-specific operators
    // ============================================

    test("date filter: before (timestamp less than)", async () => {
      await createVehicles(advancedTestVehicles);

      const tenDaysAgo = Date.now() - 86_400_000 * 10;
      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [{ field: "createdAt", operator: "before", value: tenDaysAgo }],
        },
      });
      // Should get Toyota Camry (30 days) and Corolla (15 days)
      expect(results.length).toBe(2);
      for (const v of results) {
        expect(v.createdAt).toBeLessThan(tenDaysAgo);
      }
    });

    test("date filter: after (timestamp greater than)", async () => {
      await createVehicles(advancedTestVehicles);

      const tenDaysAgo = Date.now() - 86_400_000 * 10;
      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [{ field: "createdAt", operator: "after", value: tenDaysAgo }],
        },
      });
      // Should get Honda Accord (7 days) and BMW X5 (2 days)
      expect(results.length).toBe(2);
      for (const v of results) {
        expect(v.createdAt).toBeGreaterThan(tenDaysAgo);
      }
    });

    test("date filter: between (range)", async () => {
      await createVehicles(advancedTestVehicles);

      const twentyDaysAgo = Date.now() - 86_400_000 * 20;
      const fiveDaysAgo = Date.now() - 86_400_000 * 5;
      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [
            { field: "createdAt", operator: "between", value: [twentyDaysAgo, fiveDaysAgo] },
          ],
        },
      });
      // Should get Corolla (15 days) and Accord (7 days)
      expect(results.length).toBe(2);
      for (const v of results) {
        expect(v.createdAt).toBeGreaterThanOrEqual(twentyDaysAgo);
        expect(v.createdAt).toBeLessThanOrEqual(fiveDaysAgo);
      }
    });

    // ============================================
    // String-specific operators
    // ============================================

    test("string filter: startsWith", async () => {
      await createVehicles(advancedTestVehicles);

      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [{ field: "make", operator: "startsWith", value: "Toy" }],
        },
      });
      expect(results.length).toBe(2); // Toyota Camry and Corolla
      for (const v of results) {
        expect(v.make?.startsWith("Toy")).toBe(true);
      }
    });

    test("string filter: endsWith", async () => {
      await createVehicles(advancedTestVehicles);

      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [{ field: "model", operator: "endsWith", value: "ry" }],
        },
      });
      expect(results.length).toBe(1); // Only Camry
      expect(results[0].model).toBe("Camry");
    });

    test("string filter: startsWith case-insensitive", async () => {
      await createVehicles(advancedTestVehicles);

      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [{ field: "make", operator: "startsWith", value: "toy" }],
        },
      });
      expect(results.length).toBe(2); // Should match Toyota case-insensitively
    });

    // ============================================
    // Nested field access (dot notation)
    // ============================================

    test("nested field: access with dot notation", async () => {
      // Create vehicles with specs object (simulated with a nested structure)
      const vehiclesWithSpecs = [
        {
          ...sampleVehicle,
          licensePlate: "NEST001",
          // In real usage, this would be a nested object in the schema
          // For now we test the path parsing logic works
        },
      ];
      await createVehicles(vehiclesWithSpecs);

      // Test that the dot notation parsing doesn't break regular field access
      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [{ field: "licensePlate", operator: "eq", value: "NEST001" }],
        },
      });
      expect(results.length).toBe(1);
      expect(results[0].licensePlate).toBe("NEST001");
    });
  });

  // ============================================
  // TDD: Paginate with Advanced Filters
  // ============================================

  describe("paginate with advancedFilter", () => {
    const paginateTestVehicles = Array.from({ length: 10 }, (_, index) => ({
      ...sampleVehicle,
      make: index < 5 ? "Toyota" : "Honda",
      licensePlate: `PAG${String(index).padStart(3, "0")}`,
      price: 20_000 + index * 5000,
      status: index % 3 === 0 ? ("sold" as const) : ("available" as const),
    }));

    test("paginate with index filter", async () => {
      await createVehicles(paginateTestVehicles);

      const result = await t.query(internal.testVehiclesCrud.paginate, {
        paginationOpts: { numItems: 3, cursor: null },
        advancedFilter: {
          indexName: "by_make",
          indexConditions: [{ field: "make", operator: "eq", value: "Toyota" }],
        },
      });
      expect(result.page.length).toBeLessThanOrEqual(3);
      for (const v of result.page) {
        expect(v.make).toBe("Toyota");
      }
    });

    test("paginate with post-filter", async () => {
      await createVehicles(paginateTestVehicles);

      const result = await t.query(internal.testVehiclesCrud.paginate, {
        paginationOpts: { numItems: 5, cursor: null },
        advancedFilter: {
          postFilters: [{ field: "price", operator: "gte", value: 35_000 }],
        },
      });
      for (const v of result.page) {
        expect(v.price).toBeGreaterThanOrEqual(35_000);
      }
    });

    test("paginate with order", async () => {
      await createVehicles(paginateTestVehicles);

      const result = await t.query(internal.testVehiclesCrud.paginate, {
        paginationOpts: { numItems: 3, cursor: null },
        order: { direction: "desc" },
      });
      // Most recently created should be first
      expect(result.page.length).toBe(3);
    });

    test("paginate excludes soft-deleted", async () => {
      const vehicles = await createVehicles(paginateTestVehicles.slice(0, 5));

      // Soft delete first 2
      await t.mutation(internal.testVehiclesCrud.softDelete, { id: vehicles[0]._id });
      await t.mutation(internal.testVehiclesCrud.softDelete, { id: vehicles[1]._id });

      const result = await t.query(internal.testVehiclesCrud.paginate, {
        paginationOpts: { numItems: 10, cursor: null },
      });
      expect(result.page.length).toBe(3); // 5 - 2 deleted = 3
    });
  });

  // ============================================
  // TDD: Edge Cases - between operator
  // ============================================

  describe("between operator edge cases", () => {
    test("between with same start and end value (single value match)", async () => {
      await createVehicles([
        { ...sampleVehicle, licensePlate: "BET001", price: 25_000 },
        { ...sampleVehicle, licensePlate: "BET002", price: 30_000 },
        { ...sampleVehicle, licensePlate: "BET003", price: 35_000 },
      ]);

      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [{ field: "price", operator: "between", value: [30_000, 30_000] }],
        },
      });

      expect(results.length).toBe(1);
      expect(results[0].price).toBe(30_000);
    });

    test("between with inverted range (start > end) returns empty", async () => {
      await createVehicles([
        { ...sampleVehicle, licensePlate: "BET004", price: 25_000 },
        { ...sampleVehicle, licensePlate: "BET005", price: 30_000 },
      ]);

      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [{ field: "price", operator: "between", value: [40_000, 20_000] }],
        },
      });

      expect(results.length).toBe(0);
    });

    test("between with non-numeric field returns empty", async () => {
      await createVehicles([{ ...sampleVehicle, licensePlate: "BET006", make: "Toyota" }]);

      // Intentionally testing invalid type at runtime - cast to any to bypass type safety
      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [{ field: "make", operator: "between", value: [10, 50] as any }],
        },
      });

      expect(results.length).toBe(0);
    });

    test("between with invalid value format returns empty", async () => {
      await createVehicles([{ ...sampleVehicle, licensePlate: "BET007", price: 25_000 }]);

      // Intentionally testing invalid type at runtime - cast to any to bypass type safety
      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          // Invalid: not an array of 2
          postFilters: [{ field: "price", operator: "between", value: 30_000 as any }],
        },
      });

      expect(results.length).toBe(0);
    });
  });

  // ============================================
  // TDD: Edge Cases - limit boundaries
  // ============================================

  describe("limit boundary tests", () => {
    test("limit of 0 returns empty array", async () => {
      await createVehicles([
        { ...sampleVehicle, licensePlate: "LIM001" },
        { ...sampleVehicle, licensePlate: "LIM002" },
      ]);

      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        limit: 0,
      });

      expect(results.length).toBe(0);
    });

    test("limit of 1 returns single result", async () => {
      await createVehicles([
        { ...sampleVehicle, licensePlate: "LIM003" },
        { ...sampleVehicle, licensePlate: "LIM004" },
        { ...sampleVehicle, licensePlate: "LIM005" },
      ]);

      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        limit: 1,
      });

      expect(results.length).toBe(1);
    });

    test("readMany limit of 0 returns empty array", async () => {
      await createVehicles([
        { ...sampleVehicle, licensePlate: "LIM006" },
        { ...sampleVehicle, licensePlate: "LIM007" },
      ]);

      const results = await t.query(internal.testVehiclesCrud.readMany, {
        limit: 0,
      });

      expect(results.length).toBe(0);
    });
  });

  // ============================================
  // TDD: Edge Cases - nested field access
  // ============================================

  describe("nested field access edge cases", () => {
    test("nested path on non-existent field returns no matches for in operator", async () => {
      await createVehicles([{ ...sampleVehicle, licensePlate: "NEST002" }]);

      // Try to filter on a nested path that doesn't exist
      // Intentionally testing invalid field path at runtime - cast to any to bypass type safety
      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [{ field: "specs.engine.type" as any, operator: "in", value: ["V6", "V8"] }],
        },
      });

      // Should return empty because the field doesn't exist
      expect(results.length).toBe(0);
    });

    test("nested path with contains on undefined returns no matches", async () => {
      await createVehicles([{ ...sampleVehicle, licensePlate: "NEST003" }]);

      // Intentionally testing invalid field path at runtime - cast to any to bypass type safety
      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [{ field: "owner.name" as any, operator: "contains", value: "John" }],
        },
      });

      expect(results.length).toBe(0);
    });
  });

  // ============================================
  // TDD: Empty results edge cases
  // ============================================

  describe("empty results edge cases", () => {
    test("queryAdvanced returns empty array (not null) when no matches", async () => {
      // Don't create any vehicles
      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [{ field: "make", operator: "eq", value: "NonExistentMake" }],
        },
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    test("queryAdvanced on empty table returns empty array", async () => {
      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {});

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    test("paginate on empty table returns empty page", async () => {
      const result = await t.query(internal.testVehiclesCrud.paginate, {
        paginationOpts: { numItems: 10, cursor: null },
      });

      expect(Array.isArray(result.page)).toBe(true);
      expect(result.page.length).toBe(0);
      expect(result.isDone).toBe(true);
    });
  });

  // ============================================
  // TDD: Empty postFilters array
  // ============================================

  describe("empty filter arrays", () => {
    test("queryAdvanced with empty postFilters returns all documents", async () => {
      await createVehicles([
        { ...sampleVehicle, licensePlate: "EMPT001" },
        { ...sampleVehicle, licensePlate: "EMPT002" },
      ]);

      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          postFilters: [],
        },
      });

      expect(results.length).toBe(2);
    });

    test("queryAdvanced with empty indexConditions uses index without conditions", async () => {
      await createVehicles([
        { ...sampleVehicle, licensePlate: "EMPT003", status: "available" as const },
        { ...sampleVehicle, licensePlate: "EMPT004", status: "sold" as const },
      ]);

      const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          indexName: "by_status",
          indexConditions: [],
        },
      });

      // Should return all documents (index scan without conditions)
      expect(results.length).toBe(2);
    });
  });
});

// ============================================
// Type-Safety Tests using Vitest expectTypeOf
// Run with: vitest --typecheck
// ============================================
import { assertType, expectTypeOf } from "vitest";
import type {
  FieldPaths,
  FieldType,
  FilterOperator,
  TypedAdvancedFilter,
  TypedFieldFilter,
} from "./utils/crud";

// Test document type for type-safety verification
type TestVehicle = {
  make: string;
  model: string;
  year: number;
  price: number;
  status: "available" | "sold";
  specs: {
    engine: {
      hp: number;
      type: string;
    };
    dimensions: {
      length: number;
      width: number;
    };
  };
};

// Flat document for simpler tests
type FlatDocument = {
  id: string;
  count: number;
};

describe("Type utilities - FieldPaths", () => {
  test("extracts top-level field names", () => {
    type Paths = FieldPaths<FlatDocument>;
    expectTypeOf<Paths>().toEqualTypeOf<"id" | "count">();
  });

  test("extracts nested paths with dot notation", () => {
    type Paths = FieldPaths<TestVehicle>;

    // Should include all top-level fields
    expectTypeOf<"make">().toMatchTypeOf<Paths>();
    expectTypeOf<"model">().toMatchTypeOf<Paths>();
    expectTypeOf<"year">().toMatchTypeOf<Paths>();
    expectTypeOf<"price">().toMatchTypeOf<Paths>();
    expectTypeOf<"status">().toMatchTypeOf<Paths>();
    expectTypeOf<"specs">().toMatchTypeOf<Paths>();

    // Should include nested object paths
    expectTypeOf<"specs.engine">().toMatchTypeOf<Paths>();
    expectTypeOf<"specs.dimensions">().toMatchTypeOf<Paths>();

    // Should include deeply nested paths
    expectTypeOf<"specs.engine.hp">().toMatchTypeOf<Paths>();
    expectTypeOf<"specs.engine.type">().toMatchTypeOf<Paths>();
    expectTypeOf<"specs.dimensions.length">().toMatchTypeOf<Paths>();
    expectTypeOf<"specs.dimensions.width">().toMatchTypeOf<Paths>();
  });

  test("rejects invalid paths", () => {
    type Paths = FieldPaths<TestVehicle>;

    // Invalid paths should not be assignable
    expectTypeOf<"invalid">().not.toMatchTypeOf<Paths>();
    expectTypeOf<"specs.invalid">().not.toMatchTypeOf<Paths>();
    expectTypeOf<"specs.engine.invalid">().not.toMatchTypeOf<Paths>();
    expectTypeOf<"make.nested">().not.toMatchTypeOf<Paths>(); // make is string, not object
  });

  test("is not too permissive - rejects string and any", () => {
    type Paths = FieldPaths<TestVehicle>;

    // Should not accept arbitrary strings
    expectTypeOf<string>().not.toMatchTypeOf<Paths>();

    // Should not be any
    expectTypeOf<Paths>().not.toBeAny();
  });

  test("handles object with only one field", () => {
    // Single field object should only have that one field path
    type SingleField = {
      onlyField: string;
    };
    type Paths = FieldPaths<SingleField>;
    expectTypeOf<"onlyField">().toMatchTypeOf<Paths>();
    expectTypeOf<"otherField">().not.toMatchTypeOf<Paths>();
  });
});

describe("Type utilities - FieldType", () => {
  test("infers correct type for top-level fields", () => {
    expectTypeOf<FieldType<TestVehicle, "make">>().toBeString();
    expectTypeOf<FieldType<TestVehicle, "year">>().toBeNumber();
    expectTypeOf<FieldType<TestVehicle, "status">>().toEqualTypeOf<"available" | "sold">();
  });

  test("infers correct type for nested fields", () => {
    expectTypeOf<FieldType<TestVehicle, "specs.engine.hp">>().toBeNumber();
    expectTypeOf<FieldType<TestVehicle, "specs.engine.type">>().toBeString();
    expectTypeOf<FieldType<TestVehicle, "specs.dimensions.length">>().toBeNumber();
  });

  test("infers object type for intermediate paths", () => {
    type SpecsType = FieldType<TestVehicle, "specs">;
    expectTypeOf<SpecsType>().toMatchTypeOf<{ engine: object; dimensions: object }>();

    type EngineType = FieldType<TestVehicle, "specs.engine">;
    expectTypeOf<EngineType>().toMatchTypeOf<{ hp: number; type: string }>();
  });

  test("returns never for invalid paths", () => {
    expectTypeOf<FieldType<TestVehicle, "invalid">>().toBeNever();
    expectTypeOf<FieldType<TestVehicle, "specs.invalid">>().toBeNever();
    expectTypeOf<FieldType<TestVehicle, "specs.engine.invalid">>().toBeNever();
  });
});

describe("Type utilities - FilterOperator", () => {
  test("includes all expected operators", () => {
    const operators: FilterOperator[] = [
      "eq",
      "neq",
      "gt",
      "gte",
      "lt",
      "lte",
      "in",
      "contains",
      "startsWith",
      "endsWith",
      "before",
      "after",
      "between",
    ];

    // Each operator should be valid
    for (const op of operators) {
      expectTypeOf(op).toMatchTypeOf<FilterOperator>();
    }
  });

  test("rejects invalid operators", () => {
    expectTypeOf<"invalid">().not.toMatchTypeOf<FilterOperator>();
    expectTypeOf<"EQUALS">().not.toMatchTypeOf<FilterOperator>();
  });

  test("is not too permissive", () => {
    expectTypeOf<string>().not.toMatchTypeOf<FilterOperator>();
    expectTypeOf<FilterOperator>().not.toBeAny();
  });
});

describe("Type utilities - TypedFieldFilter", () => {
  test("accepts valid field names", () => {
    const filter: TypedFieldFilter<TestVehicle> = {
      field: "make",
      operator: "eq",
      value: "Toyota",
    };
    expectTypeOf(filter.field).toMatchTypeOf<FieldPaths<TestVehicle>>();
  });

  test("accepts nested field names", () => {
    const filter: TypedFieldFilter<TestVehicle> = {
      field: "specs.engine.hp",
      operator: "gte",
      value: 200,
    };
    // Verify the field value is a valid path
    expectTypeOf(filter.field).toMatchTypeOf<FieldPaths<TestVehicle>>();
    // Verify the literal "specs.engine.hp" is assignable to FieldPaths
    expectTypeOf<"specs.engine.hp">().toMatchTypeOf<FieldPaths<TestVehicle>>();
  });

  test("accepts all valid operators", () => {
    const filters: TypedFieldFilter<TestVehicle>[] = [
      { field: "make", operator: "eq", value: "Toyota" },
      { field: "make", operator: "neq", value: "Honda" },
      { field: "year", operator: "gt", value: 2020 },
      { field: "year", operator: "gte", value: 2020 },
      { field: "year", operator: "lt", value: 2025 },
      { field: "year", operator: "lte", value: 2025 },
      { field: "status", operator: "in", value: ["available", "sold"] },
      { field: "make", operator: "contains", value: "ota" },
      { field: "make", operator: "startsWith", value: "Toy" },
      { field: "make", operator: "endsWith", value: "ta" },
      { field: "year", operator: "before", value: 2025 },
      { field: "year", operator: "after", value: 2020 },
      { field: "price", operator: "between", value: [10_000, 50_000] },
    ];

    expectTypeOf(filters).toBeArray();
  });

  test("field property is not too permissive", () => {
    type FilterField = TypedFieldFilter<TestVehicle>["field"];

    // Should not accept arbitrary strings
    expectTypeOf<string>().not.toMatchTypeOf<FilterField>();
    expectTypeOf<FilterField>().not.toBeAny();
  });
});

describe("Type utilities - TypedAdvancedFilter", () => {
  test("accepts valid filter configuration", () => {
    const filter: TypedAdvancedFilter<TestVehicle> = {
      indexName: "by_status",
      indexConditions: [{ field: "status", operator: "eq", value: "available" }],
      postFilters: [
        { field: "price", operator: "gte", value: 10_000 },
        { field: "specs.engine.hp", operator: "between", value: [150, 400] },
      ],
    };

    expectTypeOf(filter).toMatchTypeOf<TypedAdvancedFilter<TestVehicle>>();
  });

  test("all properties are optional", () => {
    const emptyFilter: TypedAdvancedFilter<TestVehicle> = {};
    const indexOnly: TypedAdvancedFilter<TestVehicle> = { indexName: "test" };
    const conditionsOnly: TypedAdvancedFilter<TestVehicle> = {
      indexConditions: [{ field: "make", operator: "eq", value: "test" }],
    };
    const filtersOnly: TypedAdvancedFilter<TestVehicle> = {
      postFilters: [{ field: "year", operator: "gt", value: 2020 }],
    };

    expectTypeOf(emptyFilter).toMatchTypeOf<TypedAdvancedFilter<TestVehicle>>();
    expectTypeOf(indexOnly).toMatchTypeOf<TypedAdvancedFilter<TestVehicle>>();
    expectTypeOf(conditionsOnly).toMatchTypeOf<TypedAdvancedFilter<TestVehicle>>();
    expectTypeOf(filtersOnly).toMatchTypeOf<TypedAdvancedFilter<TestVehicle>>();
  });

  test("nested filters use typed field paths", () => {
    type FilterType = NonNullable<TypedAdvancedFilter<TestVehicle>["postFilters"]>[number];
    expectTypeOf<FilterType>().toMatchTypeOf<TypedFieldFilter<TestVehicle>>();
  });
});

describe("Type utilities - integration with real schema", () => {
  // Use actual Doc type from generated schema
  type Vehicle = Document<"vehicles">;
  type VehiclePaths = FieldPaths<Vehicle>;

  test("extracts paths from actual schema", () => {
    // Should include all vehicle fields
    expectTypeOf<"make">().toMatchTypeOf<VehiclePaths>();
    expectTypeOf<"model">().toMatchTypeOf<VehiclePaths>();
    expectTypeOf<"year">().toMatchTypeOf<VehiclePaths>();
    expectTypeOf<"price">().toMatchTypeOf<VehiclePaths>();
    expectTypeOf<"mileage">().toMatchTypeOf<VehiclePaths>();
    expectTypeOf<"fuelType">().toMatchTypeOf<VehiclePaths>();
    expectTypeOf<"licensePlate">().toMatchTypeOf<VehiclePaths>();
    expectTypeOf<"status">().toMatchTypeOf<VehiclePaths>();
  });

  test("rejects invalid paths on real schema", () => {
    expectTypeOf<"invalidField">().not.toMatchTypeOf<VehiclePaths>();
    expectTypeOf<"nonexistent">().not.toMatchTypeOf<VehiclePaths>();
  });

  test("TypedFieldFilter works with real schema", () => {
    const filter: TypedFieldFilter<Vehicle> = {
      field: "status",
      operator: "eq",
      value: "available",
    };

    assertType<TypedFieldFilter<Vehicle>>(filter);
  });

  test("includes system fields _id and _creationTime", () => {
    expectTypeOf<"_id">().toMatchTypeOf<VehiclePaths>();
    expectTypeOf<"_creationTime">().toMatchTypeOf<VehiclePaths>();
  });

  test("FieldType returns correct types for real schema fields", () => {
    // Optional fields
    expectTypeOf<FieldType<Vehicle, "make">>().toMatchTypeOf<string | undefined>();
    expectTypeOf<FieldType<Vehicle, "year">>().toMatchTypeOf<number | undefined>();
    expectTypeOf<FieldType<Vehicle, "price">>().toMatchTypeOf<number | undefined>();
    expectTypeOf<FieldType<Vehicle, "mileage">>().toMatchTypeOf<number | undefined>();
    expectTypeOf<FieldType<Vehicle, "fuelType">>().toMatchTypeOf<
      | "gasoline"
      | "diesel"
      | "electric"
      | "hybrid"
      | "plug-in-hybrid"
      | "lpg"
      | "ethanol"
      | "hydrogen"
      | "other"
      | undefined
    >();
    // Required fields
    expectTypeOf<FieldType<Vehicle, "status">>().toEqualTypeOf<
      "draft" | "available" | "sold" | "reserved"
    >();
  });

  test("FieldType returns correct type for optional deletedAt", () => {
    type DeletedAtType = FieldType<Vehicle, "deletedAt">;
    // deletedAt is optional number
    expectTypeOf<DeletedAtType>().toMatchTypeOf<number | undefined>();
  });
});

// ============================================
// Additional Type Tests - Edge Cases
// ============================================

describe("Type utilities - deep nesting (4+ levels)", () => {
  type DeepNested = {
    level1: {
      level2: {
        level3: {
          level4: {
            value: string;
          };
        };
      };
    };
  };

  test("handles 4-level deep nesting", () => {
    type Paths = FieldPaths<DeepNested>;

    expectTypeOf<"level1">().toMatchTypeOf<Paths>();
    expectTypeOf<"level1.level2">().toMatchTypeOf<Paths>();
    expectTypeOf<"level1.level2.level3">().toMatchTypeOf<Paths>();
    expectTypeOf<"level1.level2.level3.level4">().toMatchTypeOf<Paths>();
    expectTypeOf<"level1.level2.level3.level4.value">().toMatchTypeOf<Paths>();
  });

  test("FieldType works with deeply nested paths", () => {
    expectTypeOf<FieldType<DeepNested, "level1.level2.level3.level4.value">>().toBeString();
    expectTypeOf<FieldType<DeepNested, "level1.level2.level3.level4">>().toMatchTypeOf<{
      value: string;
    }>();
  });

  test("rejects invalid deep paths", () => {
    type Paths = FieldPaths<DeepNested>;
    expectTypeOf<"level1.level2.level3.level4.invalid">().not.toMatchTypeOf<Paths>();
    expectTypeOf<"level1.invalid.level3">().not.toMatchTypeOf<Paths>();
  });
});

describe("Type utilities - array fields", () => {
  type DocumentWithArrays = {
    tags: string[];
    scores: number[];
    items: { name: string; quantity: number }[];
    nested: {
      values: boolean[];
    };
  };

  test("handles array fields at top level", () => {
    type Paths = FieldPaths<DocumentWithArrays>;

    expectTypeOf<"tags">().toMatchTypeOf<Paths>();
    expectTypeOf<"scores">().toMatchTypeOf<Paths>();
    expectTypeOf<"items">().toMatchTypeOf<Paths>();
  });

  test("handles nested array fields", () => {
    type Paths = FieldPaths<DocumentWithArrays>;

    expectTypeOf<"nested">().toMatchTypeOf<Paths>();
    expectTypeOf<"nested.values">().toMatchTypeOf<Paths>();
  });

  test("FieldType returns array types correctly", () => {
    expectTypeOf<FieldType<DocumentWithArrays, "tags">>().toEqualTypeOf<string[]>();
    expectTypeOf<FieldType<DocumentWithArrays, "scores">>().toEqualTypeOf<number[]>();
    expectTypeOf<FieldType<DocumentWithArrays, "items">>().toEqualTypeOf<
      { name: string; quantity: number }[]
    >();
    expectTypeOf<FieldType<DocumentWithArrays, "nested.values">>().toEqualTypeOf<boolean[]>();
  });
});

describe("Type utilities - optional fields", () => {
  type DocumentWithOptional = {
    required: string;
    optional?: number;
    nested: {
      alsoOptional?: boolean;
      required: string;
    };
    optionalObject?: {
      value: string;
    };
  };

  test("includes optional fields in paths", () => {
    type Paths = FieldPaths<DocumentWithOptional>;

    expectTypeOf<"required">().toMatchTypeOf<Paths>();
    expectTypeOf<"optional">().toMatchTypeOf<Paths>();
    expectTypeOf<"nested">().toMatchTypeOf<Paths>();
    expectTypeOf<"nested.alsoOptional">().toMatchTypeOf<Paths>();
    expectTypeOf<"nested.required">().toMatchTypeOf<Paths>();
  });

  test("includes paths from optional objects", () => {
    type Paths = FieldPaths<DocumentWithOptional>;

    expectTypeOf<"optionalObject">().toMatchTypeOf<Paths>();
    // Note: nested paths within optional objects may vary based on TS strictness
  });

  test("FieldType preserves optionality", () => {
    expectTypeOf<FieldType<DocumentWithOptional, "optional">>().toEqualTypeOf<number | undefined>();
    expectTypeOf<FieldType<DocumentWithOptional, "nested.alsoOptional">>().toEqualTypeOf<
      boolean | undefined
    >();
  });
});

describe("Type utilities - type rejection validation", () => {
  // These tests verify that the type system rejects invalid values
  // Using expectTypeOf().not.toMatchTypeOf() instead of @ts-expect-error
  // because @ts-expect-error doesn't work well with Vitest typecheck mode

  test("invalid field paths are rejected", () => {
    type ValidPaths = FieldPaths<TestVehicle>;

    // Invalid paths should not be assignable
    expectTypeOf<"invalid">().not.toMatchTypeOf<ValidPaths>();
    expectTypeOf<"specs.invalid">().not.toMatchTypeOf<ValidPaths>();
    expectTypeOf<"make.nested">().not.toMatchTypeOf<ValidPaths>();
    expectTypeOf<"deeply.nested.invalid.path">().not.toMatchTypeOf<ValidPaths>();
  });

  test("invalid operators are rejected", () => {
    expectTypeOf<"INVALID">().not.toMatchTypeOf<FilterOperator>();
    expectTypeOf<"equals">().not.toMatchTypeOf<FilterOperator>();
    expectTypeOf<"GREATER_THAN">().not.toMatchTypeOf<FilterOperator>();
    expectTypeOf<"!=">().not.toMatchTypeOf<FilterOperator>();
  });

  test("arbitrary strings are rejected for field paths", () => {
    type FilterField = TypedFieldFilter<TestVehicle>["field"];

    // string type should not be assignable to the field union
    expectTypeOf<string>().not.toMatchTypeOf<FilterField>();

    // any should not match the specific union
    expectTypeOf<FilterField>().not.toBeAny();
  });

  test("TypedFieldFilter enforces correct field types", () => {
    // Verify the filter's field property rejects invalid paths
    type FilterField = TypedFieldFilter<TestVehicle>["field"];
    type FilterOperatorProperty = TypedFieldFilter<TestVehicle>["operator"];

    // Valid paths are accepted
    expectTypeOf<"make">().toMatchTypeOf<FilterField>();
    expectTypeOf<"specs.engine.hp">().toMatchTypeOf<FilterField>();

    // Invalid paths are rejected
    expectTypeOf<"notAField">().not.toMatchTypeOf<FilterField>();

    // Valid operators are accepted
    expectTypeOf<"eq">().toMatchTypeOf<FilterOperatorProperty>();
    expectTypeOf<"contains">().toMatchTypeOf<FilterOperatorProperty>();

    // Invalid operators are rejected
    expectTypeOf<"invalid">().not.toMatchTypeOf<FilterOperatorProperty>();
  });
});

describe("Type utilities - union and intersection types", () => {
  type DocumentA = {
    fieldA: string;
    shared: number;
  };

  type DocumentB = {
    fieldB: string;
    shared: number;
  };

  test("handles intersection types", () => {
    type Combined = DocumentA & DocumentB;
    type Paths = FieldPaths<Combined>;

    expectTypeOf<"fieldA">().toMatchTypeOf<Paths>();
    expectTypeOf<"fieldB">().toMatchTypeOf<Paths>();
    expectTypeOf<"shared">().toMatchTypeOf<Paths>();
  });
});

describe("Type utilities - readonly fields", () => {
  type DocumentWithReadonly = {
    mutable: string;
    readonly immutable: number;
    nested: {
      readonly readonlyNested: boolean;
    };
  };

  test("includes readonly fields in paths", () => {
    type Paths = FieldPaths<DocumentWithReadonly>;

    expectTypeOf<"mutable">().toMatchTypeOf<Paths>();
    expectTypeOf<"immutable">().toMatchTypeOf<Paths>();
    expectTypeOf<"nested.readonlyNested">().toMatchTypeOf<Paths>();
  });

  test("FieldType works with readonly fields", () => {
    expectTypeOf<FieldType<DocumentWithReadonly, "immutable">>().toBeNumber();
    expectTypeOf<FieldType<DocumentWithReadonly, "nested.readonlyNested">>().toBeBoolean();
  });
});

import type { DataModel } from "./_generated/dataModel";
// ============================================
// TDD: Type-Safe IndexName Tests
// ============================================
import type {
  IndexFieldFilter,
  IndexFields,
  IndexNames,
  TypedAdvancedFilterWithIndex,
} from "./utils/crud";

describe("Type utilities - IndexNames extraction", () => {
  // The vehicles table has indexes: by_status, by_make, by_license_plate
  type VehicleIndexNames = IndexNames<DataModel, "vehicles">;

  test("extracts valid index names from schema", () => {
    // Valid index names should be accepted
    expectTypeOf<"by_status">().toMatchTypeOf<VehicleIndexNames>();
    expectTypeOf<"by_make">().toMatchTypeOf<VehicleIndexNames>();
    expectTypeOf<"by_license_plate">().toMatchTypeOf<VehicleIndexNames>();
  });

  test("rejects invalid index names", () => {
    // Invalid index names should NOT be accepted
    expectTypeOf<"by_statusNOTSAFE">().not.toMatchTypeOf<VehicleIndexNames>();
    expectTypeOf<"invalid_index">().not.toMatchTypeOf<VehicleIndexNames>();
    expectTypeOf<"by_nonexistent">().not.toMatchTypeOf<VehicleIndexNames>();
  });

  test("is not too permissive - rejects arbitrary strings", () => {
    // string type should not be assignable
    expectTypeOf<string>().not.toMatchTypeOf<VehicleIndexNames>();
    // Should not be any
    expectTypeOf<VehicleIndexNames>().not.toBeAny();
  });
});

describe("Type utilities - TypedAdvancedFilterWithIndex", () => {
  type VehicleFilter = TypedAdvancedFilterWithIndex<DataModel, "vehicles">;

  test("accepts valid index names", () => {
    const validFilter: VehicleFilter = {
      indexName: "by_status",
      indexConditions: [{ field: "status", operator: "eq", value: "available" }],
    };
    expectTypeOf(validFilter).toMatchTypeOf<VehicleFilter>();
  });

  test("indexName property only accepts valid indexes", () => {
    type IndexNameProperty = NonNullable<VehicleFilter["indexName"]>;

    // Valid indexes are accepted
    expectTypeOf<"by_status">().toMatchTypeOf<IndexNameProperty>();
    expectTypeOf<"by_make">().toMatchTypeOf<IndexNameProperty>();
    expectTypeOf<"by_license_plate">().toMatchTypeOf<IndexNameProperty>();

    // Invalid indexes are rejected
    expectTypeOf<"by_statusNOTSAFE">().not.toMatchTypeOf<IndexNameProperty>();
    expectTypeOf<"invalid">().not.toMatchTypeOf<IndexNameProperty>();
    expectTypeOf<string>().not.toMatchTypeOf<IndexNameProperty>();
  });

  test("allows filter without indexName (table scan)", () => {
    const filterWithoutIndex: VehicleFilter = {
      postFilters: [{ field: "price", operator: "gte", value: 10_000 }],
    };
    expectTypeOf(filterWithoutIndex).toMatchTypeOf<VehicleFilter>();
  });

  test("field paths allow typed and runtime filters", () => {
    type FilterFieldPath = NonNullable<VehicleFilter["postFilters"]>[number]["field"];

    // Valid fields are accepted (typed filters)
    expectTypeOf<"make">().toMatchTypeOf<FilterFieldPath>();
    expectTypeOf<"status">().toMatchTypeOf<FilterFieldPath>();
  });
});

describe("Type utilities - Convex API args indexName", () => {
  // Test that the IndexNames type correctly extracts from DataModel
  // Note: Convex FunctionReference args are tested indirectly through IndexNames
  type VehicleIndexNames = IndexNames<DataModel, "vehicles">;

  test("IndexNames extracts exact literal union from DataModel", () => {
    // Custom schema indexes + Convex system indexes (by_id, by_creation_time)
    type ExpectedIndexes =
      | "by_status"
      | "by_make"
      | "by_license_plate"
      | "by_id"
      | "by_creation_time";

    // Custom indexes should match
    expectTypeOf<"by_status">().toMatchTypeOf<VehicleIndexNames>();
    expectTypeOf<"by_make">().toMatchTypeOf<VehicleIndexNames>();
    expectTypeOf<"by_license_plate">().toMatchTypeOf<VehicleIndexNames>();

    // System indexes should also match
    expectTypeOf<"by_id">().toMatchTypeOf<VehicleIndexNames>();
    expectTypeOf<"by_creation_time">().toMatchTypeOf<VehicleIndexNames>();

    // The extracted type should equal our expected type
    expectTypeOf<VehicleIndexNames>().toEqualTypeOf<ExpectedIndexes>();
  });

  test("IndexNames rejects invalid index names", () => {
    // Invalid indexes should NOT be assignable
    expectTypeOf<"by_statusNOTSAFE">().not.toMatchTypeOf<VehicleIndexNames>();
    expectTypeOf<"invalid_index">().not.toMatchTypeOf<VehicleIndexNames>();
    expectTypeOf<"random_string">().not.toMatchTypeOf<VehicleIndexNames>();

    // Should not be permissive string
    expectTypeOf<string>().not.toMatchTypeOf<VehicleIndexNames>();
  });
});

describe("Type utilities - IndexFields extraction", () => {
  // Test that IndexFields extracts the correct field names for each index
  // Note: Convex automatically appends _creationTime to all indexes as a tiebreaker

  test("extracts index fields including _creationTime tiebreaker", () => {
    // by_status index has ["status", "_creationTime"] (Convex adds tiebreaker)
    type StatusFields = IndexFields<DataModel, "vehicles", "by_status">;
    expectTypeOf<"status">().toMatchTypeOf<StatusFields>();
    expectTypeOf<"_creationTime">().toMatchTypeOf<StatusFields>();

    // by_make index has ["make", "_creationTime"]
    type MakeFields = IndexFields<DataModel, "vehicles", "by_make">;
    expectTypeOf<"make">().toMatchTypeOf<MakeFields>();
    expectTypeOf<"_creationTime">().toMatchTypeOf<MakeFields>();

    // by_license_plate index has ["licensePlate", "_creationTime"]
    type LicensePlateFields = IndexFields<DataModel, "vehicles", "by_license_plate">;
    expectTypeOf<"licensePlate">().toMatchTypeOf<LicensePlateFields>();
    expectTypeOf<"_creationTime">().toMatchTypeOf<LicensePlateFields>();
  });

  test("IndexFields rejects non-index fields", () => {
    type StatusFields = IndexFields<DataModel, "vehicles", "by_status">;

    // "make" is not in the by_status index
    expectTypeOf<"make">().not.toMatchTypeOf<StatusFields>();
    // "price" is not in any single-field index
    expectTypeOf<"price">().not.toMatchTypeOf<StatusFields>();
  });

  test("IndexFieldFilter constrains field to index fields", () => {
    type StatusFilter = IndexFieldFilter<DataModel, "vehicles", "by_status">;

    // Valid: field is "status" which is in by_status index
    type ValidFilter = { field: "status"; operator: "eq"; value: "available" };
    expectTypeOf<ValidFilter>().toMatchTypeOf<StatusFilter>();

    // Valid: _creationTime is also allowed (tiebreaker field)
    type TimebreakerFilter = { field: "_creationTime"; operator: "gte"; value: number };
    expectTypeOf<TimebreakerFilter>().toMatchTypeOf<StatusFilter>();

    // Invalid: field is "make" which is NOT in by_status index
    type InvalidFilter = { field: "make"; operator: "eq"; value: "Toyota" };
    expectTypeOf<InvalidFilter>().not.toMatchTypeOf<StatusFilter>();
  });
});

/**
 * Type-safe filter usage demonstration.
 * This simulates what frontend code using useQueryWithStatus would do.
 *
 * @example
 * ```tsx
 * // In a React component:
 * const { data } = useQueryWithStatus(api.vehicles.queryAdvanced, {
 *   advancedFilter: {
 *     indexName: "by_status", // ✅ Valid - IDE autocomplete shows options
 *     // indexName: "by_statusNOTSAFE", // ❌ Type error!
 *     indexConditions: [{ field: "status", operator: "eq", value: "available" }],
 *   },
 * });
 * ```
 */
describe("Type-safe filter usage (frontend simulation)", () => {
  // TypedAdvancedFilterWithIndex is what frontend should use for type-safe filters
  type VehicleAdvancedFilter = TypedAdvancedFilterWithIndex<DataModel, "vehicles">;

  test("TypedAdvancedFilterWithIndex provides type-safe indexName", () => {
    // Valid filter object - all index names accepted
    type ValidFilter1 = { indexName: "by_status" };
    type ValidFilter2 = { indexName: "by_make" };
    type ValidFilter3 = { indexName: "by_license_plate" };
    type ValidFilter4 = { indexName: "by_id" };
    type ValidFilter5 = { indexName: "by_creation_time" };

    expectTypeOf<ValidFilter1>().toMatchTypeOf<VehicleAdvancedFilter>();
    expectTypeOf<ValidFilter2>().toMatchTypeOf<VehicleAdvancedFilter>();
    expectTypeOf<ValidFilter3>().toMatchTypeOf<VehicleAdvancedFilter>();
    expectTypeOf<ValidFilter4>().toMatchTypeOf<VehicleAdvancedFilter>();
    expectTypeOf<ValidFilter5>().toMatchTypeOf<VehicleAdvancedFilter>();
  });

  test("TypedAdvancedFilterWithIndex rejects invalid indexName", () => {
    // Invalid filter objects - bad index names rejected
    type InvalidFilter1 = { indexName: "by_statusNOTSAFE" };
    type InvalidFilter2 = { indexName: "not_an_index" };
    type InvalidFilter3 = { indexName: "random" };

    // These should NOT be assignable to VehicleAdvancedFilter
    expectTypeOf<InvalidFilter1>().not.toMatchTypeOf<VehicleAdvancedFilter>();
    expectTypeOf<InvalidFilter2>().not.toMatchTypeOf<VehicleAdvancedFilter>();
    expectTypeOf<InvalidFilter3>().not.toMatchTypeOf<VehicleAdvancedFilter>();
  });

  test("TypedAdvancedFilterWithIndex accepts matching index/field combinations", () => {
    // by_status index → field must be "status" with enum value
    type ValidStatusFilter = {
      indexName: "by_status";
      indexConditions: Array<{
        field: "status";
        operator: "eq";
        value: "available" | "sold" | "reserved";
      }>;
      postFilters: Array<{ field: "make"; operator: "contains"; value: string }>;
    };
    expectTypeOf<ValidStatusFilter>().toMatchTypeOf<VehicleAdvancedFilter>();

    // by_make index → field must be "make" with string value
    type ValidMakeFilter = {
      indexName: "by_make";
      indexConditions: Array<{ field: "make"; operator: "eq"; value: string }>;
    };
    expectTypeOf<ValidMakeFilter>().toMatchTypeOf<VehicleAdvancedFilter>();

    // by_license_plate index → field must be "licensePlate" with string value
    type ValidLicensePlateFilter = {
      indexName: "by_license_plate";
      indexConditions: Array<{ field: "licensePlate"; operator: "eq"; value: string }>;
    };
    expectTypeOf<ValidLicensePlateFilter>().toMatchTypeOf<VehicleAdvancedFilter>();
  });

  test("TypedAdvancedFilterWithIndex REJECTS mismatched index/field combinations", () => {
    // ❌ by_make index cannot use "status" field
    type InvalidMakeWithStatusField = {
      indexName: "by_make";
      indexConditions: Array<{ field: "status"; operator: "eq"; value: string }>;
    };
    expectTypeOf<InvalidMakeWithStatusField>().not.toMatchTypeOf<VehicleAdvancedFilter>();

    // ❌ by_status index cannot use "make" field
    type InvalidStatusWithMakeField = {
      indexName: "by_status";
      indexConditions: Array<{ field: "make"; operator: "eq"; value: string }>;
    };
    expectTypeOf<InvalidStatusWithMakeField>().not.toMatchTypeOf<VehicleAdvancedFilter>();

    // ❌ by_license_plate index cannot use "price" field
    type InvalidLicensePlateWithPriceField = {
      indexName: "by_license_plate";
      indexConditions: Array<{ field: "price"; operator: "eq"; value: number }>;
    };
    expectTypeOf<InvalidLicensePlateWithPriceField>().not.toMatchTypeOf<VehicleAdvancedFilter>();
  });

  test("TypedAdvancedFilterWithIndex allows no index with only postFilters", () => {
    // No index specified - only postFilters
    type NoIndexFilter = {
      postFilters: Array<{ field: "make"; operator: "contains"; value: string }>;
    };
    expectTypeOf<NoIndexFilter>().toMatchTypeOf<VehicleAdvancedFilter>();

    // Explicit undefined indexName
    type UndefinedIndexFilter = {
      indexName: undefined;
      postFilters: Array<{ field: "price"; operator: "gte"; value: number }>;
    };
    expectTypeOf<UndefinedIndexFilter>().toMatchTypeOf<VehicleAdvancedFilter>();
  });

  test("Simulated useQueryWithStatus call type-checks", () => {
    // This simulates what happens when frontend calls:
    // useQueryWithStatus(api.vehicles.queryAdvanced, { advancedFilter: {...} })
    //
    // The advancedFilter.indexName should only accept valid vehicle indexes

    // Helper to type-check function args
    type QueryArgs = {
      advancedFilter?: VehicleAdvancedFilter;
      limit?: number;
    };

    // Valid call
    const validArgs: QueryArgs = {
      advancedFilter: {
        indexName: "by_status",
        indexConditions: [{ field: "status", operator: "eq", value: "available" }],
      },
      limit: 10,
    };

    expectTypeOf(validArgs).toMatchTypeOf<QueryArgs>();

    // This demonstrates how IDE would catch the error at compile time:
    // const invalidArgs: QueryArgs = {
    //   advancedFilter: {
    //     indexName: "by_statusNOTSAFE", // ❌ Type error here!
    //   },
    // };
  });

  test("Type-safe value types: enum field (status) requires enum value", () => {
    // ✅ Valid: status field accepts status enum values
    type ValidStatusValue = {
      indexName: "by_status";
      indexConditions: Array<{ field: "status"; operator: "eq"; value: "available" }>;
    };
    expectTypeOf<ValidStatusValue>().toMatchTypeOf<VehicleAdvancedFilter>();

    // ✅ Valid: status with "in" operator accepts array of enum values
    type ValidStatusInArray = {
      indexName: "by_status";
      indexConditions: Array<{
        field: "status";
        operator: "in";
        value: ("available" | "sold" | "reserved")[];
      }>;
    };
    expectTypeOf<ValidStatusInArray>().toMatchTypeOf<VehicleAdvancedFilter>();

    // ❌ Invalid: status field cannot accept string (must be enum)
    type InvalidStatusString = {
      indexName: "by_status";
      indexConditions: Array<{ field: "status"; operator: "eq"; value: "invalid_status" }>;
    };
    expectTypeOf<InvalidStatusString>().not.toMatchTypeOf<VehicleAdvancedFilter>();

    // ❌ Invalid: status field cannot accept number
    type InvalidStatusNumber = {
      indexName: "by_status";
      indexConditions: Array<{ field: "status"; operator: "eq"; value: 123 }>;
    };
    expectTypeOf<InvalidStatusNumber>().not.toMatchTypeOf<VehicleAdvancedFilter>();
  });

  test("Type-safe value types: number field (price) requires number value", () => {
    // ✅ Valid: price field accepts number
    type ValidPriceNumber = {
      postFilters: Array<{ field: "price"; operator: "gte"; value: number }>;
    };
    expectTypeOf<ValidPriceNumber>().toMatchTypeOf<VehicleAdvancedFilter>();

    // ✅ Valid: price with "between" operator accepts [number, number] tuple
    type ValidPriceBetween = {
      postFilters: Array<{ field: "price"; operator: "between"; value: [number, number] }>;
    };
    expectTypeOf<ValidPriceBetween>().toMatchTypeOf<VehicleAdvancedFilter>();
  });

  test("Type-safe value types: string field (make) requires string value", () => {
    // ✅ Valid: make field accepts string
    type ValidMakeString = {
      indexName: "by_make";
      indexConditions: Array<{ field: "make"; operator: "eq"; value: string }>;
    };
    expectTypeOf<ValidMakeString>().toMatchTypeOf<VehicleAdvancedFilter>();

    // ✅ Valid: make with "in" operator accepts string array
    type ValidMakeInArray = {
      postFilters: Array<{ field: "make"; operator: "in"; value: string[] }>;
    };
    expectTypeOf<ValidMakeInArray>().toMatchTypeOf<VehicleAdvancedFilter>();

    // indexConditions on index names still require typed values
    // (FieldFilter branch only affects postFilters without index)
    type InvalidMakeNumber = {
      indexName: "by_make";
      indexConditions: Array<{ field: "make"; operator: "eq"; value: number }>;
    };
    // This still fails because by_make index enforces types on indexConditions
    expectTypeOf<InvalidMakeNumber>().not.toMatchTypeOf<VehicleAdvancedFilter>();
  });

  test("Type-safe value types: operator-specific value types", () => {
    // ✅ Valid: "in" operator takes array of field type
    type ValidIn = {
      postFilters: Array<{ field: "year"; operator: "in"; value: number[] }>;
    };
    expectTypeOf<ValidIn>().toMatchTypeOf<VehicleAdvancedFilter>();

    // ✅ Valid: "between" operator takes [min, max] tuple
    type ValidBetween = {
      postFilters: Array<{ field: "year"; operator: "between"; value: [number, number] }>;
    };
    expectTypeOf<ValidBetween>().toMatchTypeOf<VehicleAdvancedFilter>();
  });
});

describe("Runtime validation - indexName", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  const sampleVehicle = {
    make: "Toyota",
    model: "Camry",
    description: "A reliable sedan",
    year: 2023,
    price: 28_000,
    mileage: 15_000,
    fuelType: "gasoline" as const,
    licensePlate: "IDX001",
    status: "available" as const,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  test("queryAdvanced accepts valid index name", async () => {
    await t.mutation(internal.testVehiclesCrud.create, sampleVehicle);

    // Valid index name should work
    const results = await t.query(internal.testVehiclesCrud.queryAdvanced, {
      advancedFilter: {
        indexName: "by_status",
        indexConditions: [{ field: "status", operator: "eq", value: "available" }],
      },
    });

    expect(results.length).toBe(1);
    expect(results[0].status).toBe("available");
  });

  test("queryAdvanced rejects invalid index name at runtime", async () => {
    await t.mutation(internal.testVehiclesCrud.create, sampleVehicle);

    // Invalid index name should throw validation error at runtime
    // Note: Convex types may not enforce literal unions, but runtime validation does
    await expect(
      t.query(internal.testVehiclesCrud.queryAdvanced, {
        advancedFilter: {
          indexName: "by_statusNOTSAFE" as "by_status", // Cast to bypass TS, test runtime
        },
      }),
    ).rejects.toThrow();
  });

  test("paginate accepts valid index name", async () => {
    await t.mutation(internal.testVehiclesCrud.create, sampleVehicle);

    const result = await t.query(internal.testVehiclesCrud.paginate, {
      paginationOpts: { numItems: 10, cursor: null },
      advancedFilter: {
        indexName: "by_make",
        indexConditions: [{ field: "make", operator: "eq", value: "Toyota" }],
      },
    });

    expect(result.page.length).toBe(1);
  });

  test("paginate rejects invalid index name at runtime", async () => {
    // Note: Convex types may not enforce literal unions, but runtime validation does
    await expect(
      t.query(internal.testVehiclesCrud.paginate, {
        paginationOpts: { numItems: 10, cursor: null },
        advancedFilter: {
          indexName: "invalid_index_name" as "by_status", // Cast to bypass TS, test runtime
        },
      }),
    ).rejects.toThrow();
  });
});
