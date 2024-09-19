import type {NetworkErrorParams} from "@/interfaces/network-error-params";

type JsonType = string | { [key: string]: unknown };

export class ApiException extends Error {
  public statusCode: number;
  public messages: string[];

  constructor(statusCode: number, message: string, messages: string[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.messages = messages;
    Object.setPrototypeOf(this, ApiException.prototype);  // Fix the prototype chain
  }

  /**
   * Factory method to create an ApiException from a JSON response.
   * @param json The response data (typically an object or string).
   * @param params Error handling params for keys.
   * @param statusCode HTTP status code from response, default to 400 if not provided.
   */
  static fromJson(json: JsonType, params: NetworkErrorParams, statusCode?: number): ApiException {
    try {
      let singleMessage: string | null = null;
      let multipleMessages: string[] = [];

      // Handle null or undefined JSON
      if (json == null) {
        return new ApiException(statusCode ?? 400, params.jsonNullError);
      }

      // If JSON is a string, treat it as the error message
      if (typeof json === 'string') {
        return new ApiException(statusCode ?? 400,
            json.length > 0 ? json : params.jsonIsEmptyError);
      }

      // If JSON is an object (i.e., Axios returns response.data as an object)
      if (typeof json === 'object' && Object.keys(json).length > 0) {
        // Handle the case where message is a string or array
        if (typeof json[params.messageKey] === 'string') {
          singleMessage =
              typeof json[params.messageKey] === 'string' ? json[params.messageKey] as string : '';
        } else if (Array.isArray(json[params.messageKey])) {
          multipleMessages =
              Array.isArray(json[params.messageKey]) ? json[params.messageKey] as string[] : [];
          singleMessage = multipleMessages.length > 0 ? multipleMessages[0] : null;
        }

        // Get status code from JSON or fallback
        const code = typeof json[params.statusCodeKey] === 'number'
            ? json[params.statusCodeKey] as number : (statusCode ?? 400);

        return new ApiException(
            code,
            singleMessage || params.couldNotParseError,
            multipleMessages,
        );
      }

      // If we can't parse the response, return a generic parsing error
      return new ApiException(statusCode ?? 417, params.couldNotParseError);
    } catch (e) {
      // Return a default parsing error if an exception occurs
      return new ApiException(statusCode ?? 400, params.couldNotParseError);
    }
  }
}