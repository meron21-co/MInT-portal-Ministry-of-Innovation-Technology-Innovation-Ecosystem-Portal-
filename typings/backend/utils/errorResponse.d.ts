
declare interface ErrorResponseType  {
	statusCode: any;

	constructor(message: any, statusCode: any): ErrorResponseType;
}
