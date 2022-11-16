import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

import { todoExistsInDb, updateTodoItem } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  createLogger(`Log update todo events: ${event}`);

  // check todo isExisted in db
  const isValid = await todoExistsInDb(event);

  // if todo not found return err
  if (!isValid) {
    createLogger(`not found ${event.pathParameters.todoId}`);
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        error: 'Todo not exist in db',
      }),
    };
  }

  //else founded todo -> update

  //get body in request

  //call repo to update
  await updateTodoItem(event);

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
