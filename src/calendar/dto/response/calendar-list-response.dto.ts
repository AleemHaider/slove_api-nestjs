import { isArray } from 'radash';

export class CalendarListResponseDto {
  data: any;

  constructor(data: any) {
    this.data = data;
  }

  getList() {
    const list = [];
    if (isArray(this.data)) {
      this.data = this.data as any;
      for (let i = 0; i < this.data.length; i++) {
        list.push({
          id: this.data[i].id,
          title: this.data[i].title,
          description: this.data[i].description,
          startTime: this.data[i].start_time,
          endTime: this.data[i].end_time,
          type: this.data[i].type,
        });
      }
    }
    return list;
  }
}
