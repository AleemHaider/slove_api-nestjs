import { CalendarEntity } from '../../../entity/calendar.entity';

export class CalendarResponseDto {
  data: CalendarEntity;

  constructor(data: CalendarEntity) {
    this.data = data;
  }

  getCalendar() {
    return {
      id: this.data.id,
      title: this.data.title,
      description: this.data.description,
      startTime: this.data.startTime,
      endTime: this.data.endTime,
    };
  }
}
