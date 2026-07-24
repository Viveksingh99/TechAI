import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: true;
  data: T extends { data: unknown; meta: unknown } ? T['data'] : T;
  meta?: T extends { data: unknown; meta: infer M } ? M : undefined;
  timestamp: string;
}

/**
 * Wraps every successful controller response in a consistent envelope:
 * `{ success, data, meta, timestamp }`.
 *
 * If the handler already returns a `{ data, meta }` shape (e.g. from a
 * paginated list endpoint), `data`/`meta` are hoisted to the top level so
 * consumers always read pagination info from `response.meta`.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((result: unknown) => {
        const timestamp = new Date().toISOString();

        if (
          result &&
          typeof result === 'object' &&
          'data' in (result as Record<string, unknown>) &&
          'meta' in (result as Record<string, unknown>)
        ) {
          const { data, meta } = result as { data: unknown; meta: unknown };
          return { success: true, data, meta, timestamp } as Response<T>;
        }

        return { success: true, data: result, timestamp } as Response<T>;
      }),
    );
  }
}
