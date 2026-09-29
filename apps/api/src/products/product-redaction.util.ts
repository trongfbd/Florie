import { UserRole } from '@prisma/client';

// costPrice (giá vốn sản phẩm) và material.latestCostPrice (giá vốn nguyên
// vật liệu, lộ qua tab công thức/BOM) đều bị ẩn với mọi role khác ADMIN —
// admin-facing endpoints only (storefront queries already use PUBLIC_OMIT).
function omitKeys<T extends Record<string, unknown>>(
  obj: T,
  keys: readonly string[],
): T {
  const clone: Record<string, unknown> = { ...obj };
  for (const key of keys) {
    delete clone[key];
  }
  return clone as T;
}

interface RedactableProduct {
  materials?: Array<
    { material?: Record<string, unknown> } & Record<string, unknown>
  >;
  [key: string]: unknown;
}

export function redactProductForRole<T extends RedactableProduct>(
  product: T,
  role: UserRole,
): T {
  if (role === UserRole.ADMIN) {
    return product;
  }

  let result: T = omitKeys(product, ['costPrice']);

  if (result.materials) {
    result = {
      ...result,
      materials: result.materials.map((productMaterial) =>
        productMaterial.material
          ? {
              ...productMaterial,
              material: omitKeys(productMaterial.material, ['latestCostPrice']),
            }
          : productMaterial,
      ),
    };
  }

  return result;
}
