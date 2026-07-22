export type CatalogEntry = Record<string, unknown>;
export type CatalogCollection = {
  presets: CatalogEntry[];
  commands: CatalogEntry[];
  keyCombos: CatalogEntry[];
};

export function catalogIntegrityErrors(catalogs: CatalogCollection): string[];
export function assertCatalogIntegrity(catalogs: CatalogCollection): true;
