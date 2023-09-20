export class PreferenceListDto {
  list: { id: number; type: string }[];

  constructor(itemList: { id: number; type: string }[]) {
    this.list = itemList;
  }

  getList() {
    return this.list;
  }
}
