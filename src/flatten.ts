type Primitive = string | number | boolean;
type Nested = { [key: string]: Nested | Primitive };

// FIXME: In order to have source typed specifically
// and not as "any" would be to update the body of the
// helper function to give separate structure for
// handling arrays.
export function flatten(source: any) {
  const result: { [key: string]: Primitive } = {};

  function flattenHelper(obj: Nested, parentKey = "") {
    for (let key in obj) {
      const currentObj = obj[key];
      const newKey = parentKey ? `${parentKey}.${key}` : key;

      if (typeof currentObj === "object" && currentObj !== null) {
        flattenHelper(currentObj, newKey);
      } else {
        result[newKey] = currentObj as Primitive;
      }
    }
  }

  flattenHelper(source);

  return result;
}

console.log(flatten({
  a: 1,
  b: {
    c: true,
    d: {
      e: "foo",
    },
  },
  f: false,
  g: ["red", "green", "blue"],
  h: [
    {
      i: 2,
      j: 3,
    },
  ],
}));
