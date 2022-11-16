import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { createTodoItem } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  createLogger(`Log event create todo: ${event}`);
  // create item
  const item = await createTodoItem(event);

  createLogger(`Log event create success: ${item}`);
  // 201 status for created
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      item,
    }),
  };
};
