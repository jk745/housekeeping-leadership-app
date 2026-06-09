import {
  getAllEntryTypeConfigs,
  getEntryTypeConfig,
} from "../src/lib/entry-types";
import { entryTypeIds } from "../src/lib/types";

describe("entry type config", () => {
  it("defines all six entry types", () => {
    expect(getAllEntryTypeConfigs().map((config) => config.id)).toEqual(
      entryTypeIds,
    );
  });

  it("returns quick and detailed fields for 現場觀察 with planned names", () => {
    const config = getEntryTypeConfig("field-observation");

    expect(config.label).toBe("現場觀察");
    expect(config.quickFields.map((field) => field.name)).toEqual([
      "todaySeen",
      "frictionPoint",
      "firstFeeling",
    ]);
    expect(config.detailedFields.map((field) => field.name)).toEqual([
      "scene",
      "processSeen",
      "unknowns",
      "impactOnFrontDesk",
      "impactOnHousekeeping",
      "improvementIdea",
    ]);
  });

  it("keeps every entry type populated and field keys unique", () => {
    for (const config of getAllEntryTypeConfigs()) {
      expect(config.quickFields.length).toBeGreaterThan(0);
      expect(config.detailedFields.length).toBeGreaterThan(0);

      const fieldNames = [
        ...config.quickFields.map((field) => field.name),
        ...config.detailedFields.map((field) => field.name),
      ];

      expect(new Set(fieldNames).size).toBe(fieldNames.length);
    }
  });
});
