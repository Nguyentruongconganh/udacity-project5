import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { deleteTodoItem, todoExistsInDb } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  createLogger(`delete todo event: ${event}`);
  // check todo is existed in db
  const isValid = await todoExistsInDb(event);

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
        error: 'This todo item not exist in db.',
      }),
    };
  }
  // founded -> remove

  await deleteTodoItem(event);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({}),
  };
};
