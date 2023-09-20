export class GetCurrentUserContactListDto {
  data: any;
  count: number;
  page: string;
  limit: string;
  sort: string;
  constructor(
    data: any,
    count: number,
    page = '1',
    limit = '10',
    sort = 'asc',
  ) {
    this.data = data;
    this.count = count ? count : 0;
    this.page = page;
    this.limit = limit;
    this.sort = sort;
  }

  getList() {
    const list = [];
    if (this.data.length === 0) {
      return {
        data: list,
      };
    }
    const totalPages = Math.ceil(Number(this.count) / Number(this.limit));

    this.data.map((item) => {
      console.log(item);
      const obj = {
        userId: item.user_id,
        email: item.email,
        mobilePhone: item.mobile_phone,
        profileImage: item.profile_image,
        userType: item.user_type,
        userTypeId: item.user_type_id,
        currentUserId: item.current_user_id,
        name: item.band_name || item.venue_name || item.consumer_name,
        chatId: item.chat_id,
        audioUrl: item.audioUrl,
      };
      list.push(obj);
    });

    return {
      data:
        this.sort == 'asc'
          ? this.getNameSortedList(list)
          : this.getNameSortedList(list).reverse(),
      meta: {
        itemsPerPage: Number(this.limit),
        totalItems: Number(this.count),
        currentPage: Number(this.page),
        nextPage:
          Number(this.page) + 1 > totalPages ? null : Number(this.page) + 1,
        totalPages: totalPages,
      },
    };
  }

  private getNameSortedList(list: any[]) {
    return list.sort((a, b): number => {
      const listA = a.name ? a.name : '';
      const listB = b.name ? b.name : '';
      return listA.localeCompare(listB);
    });
  }
}

//
// {
//   "user_id": 24,
//   "email": "artist@gmail.com",
//   "mobile_phone": "0788878980",
//   "profile_image": "",
//   "user_type": "Artist",
//   "user_type_id": 1,
//   "current_user_id": 101,
//   "band_name": "TestBand",
//   "venue_name": null,
//   "consumer_name": null,
//   "chat_id": 137289732
// },
