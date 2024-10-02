enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

namespace RequestMethod {
  export function toString(type: RequestMethod): string {
    return type.toString();
  }
}

export { RequestMethod };
