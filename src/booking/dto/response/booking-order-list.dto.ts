import { isArray } from 'radash';

export class BookingOrderListDto {
  getList(data: any, count: number, page: number, limit: number) {
    const list = [];
    if (data && isArray(data)) {
      data = data as any;
      for (let i = 0; i < data.length; i++) {
        const element = data[i];

        const obj = {
          eventId: element.event_id,
          quantity: element.quantity,
          eventName: element.event_name,
          startTime: element.start_time,
          endTime: element.end_time,
          ticketPrice: element.ticket_price,
          musicGenre: element.music_genre,
          orders: this.setOrderDetails(element.orders),
          isFeedbackGiven: !!element.feedback_id,
          artist: {
            id: element.artist_id,
            name: element.artist_name,
            country: element.artist_country,
            city: element.artist_city,
            bio: element.artist_bio,
            profileImage: element.artist_profile_image,
          },
          venue: {
            id: element.venue_id,
            name: element.venue_name,
            profileImage: element.venue_profile_image,
            country: element.venue_country,
            city: element.venue_city,
          },
        };
        list.push(obj);
      }
    }
    const totalPages = Math.ceil(count / limit);

    return {
      data: list,
      meta: {
        // = (int)Math.Ceiling((float)_collection.Count / (float)_itemsPerPage);
        itemsPerPage: limit,
        totalItems: Number(count),
        currentPage: page,
        nextPage: page + 1 > totalPages ? null : page + 1,
        totalPages: totalPages,
      },
    };
  }

  private setOrderDetails(order: any[]) {
    const list = [];
    if (order && order.length > 0) {
      for (let i = 0; i < order.length; i++) {
        const element = order[i];

        const obj = {
          id: element.id,
          quantity: element.quantity,
          orderStatus: element.order_status,
          invoiceNumber: element.invoice_number,
          totalPrice: element.total_price,
          tickets: element.tickets
            ? this.setTicketsDetails(element.tickets)
            : null,
        };
        list.push(obj);
      }
    }
    return list;
  }
  private setTicketsDetails(tickets: any[]) {
    const list = [];
    if (tickets && tickets.length > 0) {
      for (let i = 0; i < tickets.length; i++) {
        const element = tickets[i];
        const obj = {
          id: element.id,
          ticketNumber: element.ticket_number,
          ticketPrice: element.ticket_price,
        };
        list.push(obj);
      }
    }
    return list;
  }
}
