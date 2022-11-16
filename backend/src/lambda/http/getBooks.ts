import { getAllBooks } from '../../businessLogic/books';
import { createLogger } from '../../utils/logger';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // write log
  createLogger(`Get book list event: ${event}`);

  // get all books by userId
  const listBook = await getAllBooks(event);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({ items: listBook }),
  };
};
