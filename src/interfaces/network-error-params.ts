export class NetworkErrorParams {
  messageKey: string;
  statusCodeKey: string;
  noInternetError: string;
  couldNotParseError: string;
  jsonNullError: string;
  jsonIsEmptyError: string;
  notMapTypeError: string;
  jsonUnsupportedObjectError: string;

  constructor({
    messageKey = "message",
    statusCodeKey = "status",
    noInternetError = "No internet connection",
    couldNotParseError = "Could not parse the error",
    jsonNullError = "Empty error message",
    jsonIsEmptyError = "Empty error message",
    notMapTypeError = "Could not parse the response: Not a Map type",
    jsonUnsupportedObjectError = "Unsupported object",
  }: {
    messageKey?: string;
    statusCodeKey?: string;
    noInternetError?: string;
    couldNotParseError?: string;
    jsonNullError?: string;
    jsonIsEmptyError?: string;
    notMapTypeError?: string;
    jsonUnsupportedObjectError?: string;
  } = {}) {
    this.messageKey = messageKey;
    this.statusCodeKey = statusCodeKey;
    this.noInternetError = noInternetError;
    this.couldNotParseError = couldNotParseError;
    this.jsonNullError = jsonNullError;
    this.jsonIsEmptyError = jsonIsEmptyError;
    this.notMapTypeError = notMapTypeError;
    this.jsonUnsupportedObjectError = jsonUnsupportedObjectError;
  }
}
