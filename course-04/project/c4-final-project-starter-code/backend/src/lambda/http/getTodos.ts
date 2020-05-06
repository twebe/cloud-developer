import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getTodos } from '../../businessLogic/todos'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Get all TODO items for a current user
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const todoList = await getTodos(jwtToken);

  return {
      statusCode: 200,
      body: JSON.stringify({
          items: todoList
      })
  };
})

handler.use(
  cors({
    credentials: true
  })
)