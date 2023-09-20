export class CityListDto {
  data: any;
  constructor(data: any) {
    this.data = data;
  }

  getList() {
    if (!this.data || this.data.length == 0) {
      return [];
    }
    const list = [];
    for (let i = 0; i < this.data.length; i++) {
      const obj = {
        id: this.data[i].id,
        name: this.data[i].name,
        countryId: this.data[i].country_id,
      };
      list.push(obj);
    }
    return list;
  }
}

// {
//   "id": 15,
//   "name": "Andau",
//   "country_id": 15
// },
