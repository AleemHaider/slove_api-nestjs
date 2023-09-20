export enum STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export enum USER_REGISTER_TYPE {
  CUSTOM = 'CUSTOM',
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
}

export enum USER_TYPE {
  ARTIST = 1,
  VENUE = 2,
  CONSUMER = 3,
}

export enum SINGLE_FILE_UPLOAD_TYPE {
  PROFILE_IMAGE = 'PROFILE_IMAGE',
  AUDIO_URL='AUDIO_URL'
}

export enum MULTIPLE_FILE_UPLOAD_TYPE {
  GALLERY = 'GALLERY',
}
export const USER_QUESTION_COUNT = {
  ARTIST: 12,
  VENUE: 13,
  CONSUMER: 9,
};
export enum DISCOVER_PREFERENCE_TYPE {
  VENUE = 1,

  ARTIST = 2,
  EVENT = 3,
}

export enum BOOKING_STATUS {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

export enum BOOKING_CONTRACT_STATUS {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

export enum CALENDAR_TYPE {
  EVENT = 'EVENT',
  CUSTOM = 'CUSTOM',
}

export enum ORDER_STATUS {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}
// export interface CommonListResponseInterface<T> {
//   data?: T[] | null;
//   meta: Meta;
//   links: Links;
// }
// interface Meta {
//   itemsPerPage: number;
//   totalItems: number;
//   currentPage: number;
//   totalPages: number;
//   sortBy?: string[][] | null;
// }
