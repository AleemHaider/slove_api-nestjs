import * as dayjs from 'dayjs';
const bookingOrderWhere = (type: string | undefined) => {
  let query = '';

  if (type == 'upcoming') {
    query =
      query +
      `and e.start_time  >='${dayjs(new Date()).format('YYYY-MM-DD')}' `;
  }
  if (type == 'past') {
    query =
      query +
      `and e.start_time  <='${dayjs(new Date()).format('YYYY-MM-DD')}' `;
  }
  return query;
};

export { bookingOrderWhere };
