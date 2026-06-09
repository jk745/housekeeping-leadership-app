import {
  entryTypeConfigs,
  getEntryTypePath,
} from "../../lib/entry-types";
import { entryTypeIds, type EntryTypeId } from "../../lib/types";

export const homeEntries = entryTypeIds.map((id) => {
  const config = entryTypeConfigs[id];

  return {
    id,
    title: config.label,
    path: getEntryTypePath(id),
    description: config.description,
  };
});

export const entryMetaBySlug = Object.fromEntries(
  entryTypeIds.map((id) => {
    const config = entryTypeConfigs[id];

    return [
      id,
      {
        title: config.label,
        hint: config.hint,
      },
    ];
  }),
) as Record<EntryTypeId, { title: string; hint: string }>;

export type EntrySlug = EntryTypeId;
