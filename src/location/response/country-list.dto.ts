export class CountryListDto {
  data: any;

  constructor(data: any) {
    this.data = data;
  }

  getList() {
    const list = [];
    if (!this.data || this.data.length == 0) {
      return list;
    }
    for (let i = 0; i < this.data.length; i++) {
      const obj = {
        id: this.data[i].id,
        name: this.data[i].name,
        phoneCode: this.data[i].phone_code,
        capital: this.data[i].capital,
        currency: this.data[i].currency,
        iso2: this.data[i].iso2,
        iso3: this.data[i].iso3,
        numericCode: this.data[i].numeric_code,
      };
      list.push(obj);
    }
    return list;
  }
}

//
// {
//   "id": 15,
//   "name": "Austria",
//   "phone_code": "43",
//   "capital": "Vienna",
//   "currency": "EUR",
//   "iso2": "AT",
//   "iso3": "AUT",
//   "numeric_code": "040"
// },
