import { OmitType } from '@nestjs/swagger';
import { CreateOrderDto } from '../../orders/dto/create-order.dto';

// customerId is derived from the (optional) customer JWT — never client-settable.
// shippingFee/source are also server-controlled for the public checkout flow.
export class CreateStorefrontOrderDto extends OmitType(CreateOrderDto, [
  'customerId',
  'shippingFee',
  'source',
] as const) {}
