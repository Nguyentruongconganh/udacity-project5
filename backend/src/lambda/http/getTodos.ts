import { getAllTodos } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // write log
  createLogger(`Get todo list event: ${event}`);

  // get all todos by userId
  const listTodo = await getAllTodos(event);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({ items: listTodo }),
  };
};
