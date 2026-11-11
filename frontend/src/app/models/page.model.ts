/** Shared pagination shapes. The backend returns a Spring-style page object
 *  when ?page&size are sent, and a plain array when they are not. */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export function normalizePage<T>(res: T[] | PageResponse<T>): PageResponse<T> {
  if (Array.isArray(res)) {
    return {
      content: res,
      page: 0,
      size: res.length || 10,
      totalElements: res.length,
      totalPages: res.length > 0 ? 1 : 0
    };
  }
  return {
    content: res.content ?? [],
    page: res.page ?? 0,
    size: res.size ?? 10,
    totalElements: res.totalElements ?? (res.content?.length ?? 0),
    totalPages: res.totalPages ?? 0
  };
}

/** Client-side paging for demo data / array fallbacks. */
export function paginateClient<T>(items: T[], page: number, size: number): PageResponse<T> {
  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / size);
  const safePage = Math.max(0, Math.min(page, Math.max(0, totalPages - 1)));
  return {
    content: items.slice(safePage * size, safePage * size + size),
    page: safePage,
    size,
    totalElements: total,
    totalPages
  };
}
