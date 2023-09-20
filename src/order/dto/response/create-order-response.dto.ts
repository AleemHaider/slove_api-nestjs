export class CreateOrderResponseDto {
  id: string;
  clientSecret: string;
  currency: string;
  eventName: string;
  eventId: number;
  invoiceNumber: string;

  constructor(
    id: string,
    clientSecret: string,
    currency: string,
    eventName: string,
    eventId: number,
    invoiceNumber: string,
  ) {
    this.id = id;
    this.clientSecret = clientSecret;
    this.currency = currency;
    this.eventName = eventName;
    this.eventId = eventId;
    this.invoiceNumber = invoiceNumber;
  }
}
