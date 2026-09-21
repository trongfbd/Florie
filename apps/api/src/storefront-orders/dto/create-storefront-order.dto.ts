import { OmitType } from '@nestjs/swagger';
import { CreateOrderDto } from '../../orders/dto/create-order.dto';

// customerId is derived from the (optional) customer JWT — never client-settable.
// shippingFee/source are also server-controlled for the public checkout flow.
// channel always defaults to WEB for storefront orders; depositAmount is an
// admin-manual-order concept (cash/transfer collected outside this flow) —
// both must stay off this DTO, same reasoning as source above.
export class CreateStorefrontOrderDto extends OmitType(CreateOrderDto, [
  'customerId',
  'shippingFee',
  'source',
  'channel',
  'depositAmount',
] as const) {}
