import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getTodos } from '../../businessLogic/todos'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Get all TODO items for a current user
  const authHeader = event.headers.Authorization;
  const split = authHeader.split(' ')
  const jwtToken = split[1]

  // Get the list of TODO items for the user
  const list = await getTodos(jwtToken);

  return {
      statusCode: 200,
      body: JSON.stringify({
          items: list
      })
  };
})

handler.use(
  cors({
    credentials: true
  })
)