import { map } from "fp-ts/Either";

import { Fetch } from "../Fetch.js";
import { HttpResponse } from "./response/index.js";

export const fetch = (url: string | URL, init?: RequestInit) => {
  return <E>(fetch: Fetch<E>) => fetch(url, init);
};

export const fetch_ = (url: string | URL, init?: RequestInit) => {
  return async <E>(fetch: Fetch<E>) => {
    const res = await fetch(url, init);
    return map((res: Response) => new HttpResponse(res))(res);
  };
};
