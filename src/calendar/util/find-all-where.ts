import * as dayjs from 'dayjs';
import { CALENDAR_TYPE } from '../../util/constant';

export const getWhereListCalendar = (
  userId: string | undefined,
  startDate: string | undefined,
  endDate: string | undefined,
  type: undefined | CALENDAR_TYPE,
) => {
  let query = '';
  let limit = '';
  if (userId) {
    query = query + ` and c.user_id=${userId}`;
  }
  if (startDate && endDate) {
    query =
      query +
      `and(start_time >='${dayjs(startDate).format(
        'YYYY-MM-DD',
      )}' and end_time < '${dayjs(endDate)
        .add(1, 'day')
        .format('YYYY-MM-DD')}')`;
  } else {
    query = query + `and (start_time >='${dayjs().format('YYYY-MM-DD')}' ) `;
    limit = 'limit 35';
  }

  if (type) {
    query = query + ` and (c.type='${type}')`;
  }
  return { query, limit };
};
