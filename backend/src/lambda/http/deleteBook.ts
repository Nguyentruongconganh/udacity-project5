import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { deleteBookItem, bookExistsInDb } from '../../businessLogic/books';
import { createLogger } from '../../utils/logger';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  createLogger(`delete book event: ${event}`);
  // check book is existed in db
  const isValid = await bookExistsInDb(event);

  //if not found -> return err

  if (!isValid) {
    createLogger(`not founded: ${event}`);
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        error: 'This book item not exist in db.',
      }),
    };
  }
  // founded -> remove

  await deleteBookItem(event);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({}),
  };
};
