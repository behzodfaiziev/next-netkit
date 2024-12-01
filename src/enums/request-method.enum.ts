enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

function requestMethodToString(type: RequestMethod): string {
  return type.toString();
}

export { RequestMethod, requestMethodToString };
