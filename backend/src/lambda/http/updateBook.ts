import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

import { bookExistsInDb, updateBookItem } from '../../businessLogic/books';
import { createLogger } from '../../utils/logger';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  createLogger(`Log update book events: ${event}`);

  // check book isExisted in db
  const isValid = await bookExistsInDb(event);

  // if book not found return err
  if (!isValid) {
    createLogger(`not found ${event.pathParameters.bookId}`);
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        error: 'Book not exist in db',
      }),
    };
  }

  //else founded book -> update

  //get body in request

  //call repo to update
  await updateBookItem(event);

  //204 for update and delete success

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(event?.pathParameters || null),
  };
};
