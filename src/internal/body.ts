interface Base {
  readonly _tag: string;
  readonly headers?: Record<string, string>;
}

export interface Text extends Base {
  readonly _tag: "Text";
  readonly value: string;
}

export interface Form extends Base {
  readonly _tag: "Form";
  readonly value: FormData;
}

export interface Json extends Text {}

export type Body = Text | Json | Form;

export function isBody(input: unknown): input is Body {
  return (
    typeof input === "object" &&
    input !== null &&
    "_tag" in input &&
    (input._tag === "Text" || input._tag === "Form")
  );
}

export function text(input: string): Body {
  return {
    _tag: "Text",
    value: input,
    headers: {
      "Content-Type": "text/plain",
      "Content-Length": input.length.toString(),
    },
  };
}

export function json(input: object): Body {
  const body = JSON.stringify(input);
  return {
    _tag: "Text",
    value: body,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Content-Length": body.length.toString(),
    },
  };
}

export function form(
  input: FormData | Record<string, string | Array<unknown>>
): Body {
  const formData = new FormData();

  if (!(input instanceof FormData)) {
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        const item = input[key];

        if (Array.isArray(item)) {
          for (let n of item) formData.append(key, n as any);
        } else {
          formData.set(key, item);
        }
      }
    }
  }

  return {
    _tag: "Form",
    value: formData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
}
