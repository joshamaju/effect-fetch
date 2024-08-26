import { isLeft, Either } from "fp-ts/Either";

export const chain = async <E, A, E1, B>(
  response: Either<E, A>,
  fn: (res: A) => Promise<Either<E1, B>>
): Promise<Either<E | E1, B>> => {
  if (isLeft(response)) return response;
  const result = await fn(response.right);
  return result;
};
