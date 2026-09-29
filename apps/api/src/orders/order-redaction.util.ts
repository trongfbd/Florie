import { UserRole } from '@prisma/client';

// OPERATIONS_ADMIN sees money (giá bán/phí ship/tổng tiền) but never giá vốn.
// STAFF sees no money anywhere on an order. ADMIN is untouched (return as-is).
const ITEM_COST_ONLY_OMIT = ['costPrice'] as const;
const ITEM_ALL_MONEY_OMIT = ['unitPrice', 'subtotal', 'costPrice'] as const;
const ORDER_ALL_MONEY_OMIT = [
  'subtotal',
  'shippingFee',
  'discountAmount',
  'depositAmount',
  'total',
] as const;

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

interface RedactableOrder {
  items?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

/** Strips money fields an order response carries, based on the requesting
 * user's role. Applied at the controller boundary (not inside the service)
 * so every internal caller of OrdersService keeps working with full data —
 * only what actually leaves the server over HTTP is redacted. */
export function redactOrderForRole<T extends RedactableOrder>(
  order: T,
  role: UserRole,
): T {
  if (role === UserRole.ADMIN) {
    return order;
  }

  let result: T = order;

  if (result.items) {
    const itemOmit =
      role === UserRole.STAFF ? ITEM_ALL_MONEY_OMIT : ITEM_COST_ONLY_OMIT;
    result = {
      ...result,
      items: result.items.map((item) => omitKeys(item, itemOmit)),
    };
  }

  if (role === UserRole.STAFF) {
    result = omitKeys(result, ORDER_ALL_MONEY_OMIT);
  }

  return result;
}
