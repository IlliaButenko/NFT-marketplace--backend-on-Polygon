export interface PaginateResponse<T> {
  items: any;
  paginate: PaginateMeta;
}

export interface PaginateMeta {
  count: number;
  page: number;
  size: number;
}
