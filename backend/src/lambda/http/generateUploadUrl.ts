import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { createLogger } from '../../utils/logger';
import { getUploadUrlLink, todoExistsInDb } from '../../businessLogic/todos';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  createLogger(`Log upload image url todo events: ${event}`);

  const isValid = await todoExistsInDb(event);

  // if not founded -> return err
  if (!isValid) {
    createLogger(`not founded: ${event}`);
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        error: 'Todo item not exist in db',
      }),
    };
  }

  //found -> upload img -> get url link

  const imageUrl = await getUploadUrlLink(event);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      uploadUrl: imageUrl,
    }),
  };
};
