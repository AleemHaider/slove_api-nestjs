export const paginationUtil = (
  page: string | undefined,
  limit: string | undefined,
): string => {
  // order by s.id asc  limit 10  offset 0
  // # off = (page - 1)*20 ;
  // # row = 20;
  // # select * from table limit (off, row);
  let query = '';

  if (!limit) limit = '10';

  if (!page) page = '1';

  query =
    query +
    ` LIMIT ${Number(limit)} OFFSET ${(Number(page) - 1) * Number(limit)}`;
  console.log(query);
  return query;
};

export default paginationUtil;
