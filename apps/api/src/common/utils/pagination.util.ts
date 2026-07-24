import { PaginationDto } from '../dto/pagination.dto';
import { PaginatedResult } from '../interfaces/paginated-result.interface';

/**
 * Builds a consistent `{ data, meta }` payload from a page of rows and the
 * total row count for the unfiltered query.
 */
export function createPaginatedResult<T>(
  data: T[],
  total: number,
  pagination: Pick<PaginationDto, 'page' | 'limit'>,
): PaginatedResult<T> {
  const { page, limit } = pagination;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Builds a case-insensitive Prisma `OR` filter across the provided fields
 * for the given search term. Returns `undefined` when there is nothing to
 * search for, so callers can safely spread the result into a `where` clause.
 */
export function buildSearchFilter(
  search: string | undefined,
  fields: string[],
):
  | { OR: Record<string, { contains: string; mode: 'insensitive' }>[] }
  | undefined {
  if (!search || fields.length === 0) {
    return undefined;
  }

  return {
    OR: fields.map((field) => ({
      [field]: { contains: search, mode: 'insensitive' as const },
    })),
  };
}
