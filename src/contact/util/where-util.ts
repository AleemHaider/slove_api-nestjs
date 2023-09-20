const getCurrentUserWhere = (
  search: string | undefined,
  userType: string | undefined,
) => {
  let query = "and u.status = 'ACTIVE'";
  if (userType) {
    query = query + ` and ut.id ='${userType}'  `;
  }
  if (search && search.length > 0) {
    query =
      query +
      ` and (uq.band_name ilike '%${search}%' or uq.venue_name ilike '%${search}%' or uq.consumer_name ilike '%${search}%' or u.email ilike '%${search}%') `;
  }
  return query;
};

export { getCurrentUserWhere };
