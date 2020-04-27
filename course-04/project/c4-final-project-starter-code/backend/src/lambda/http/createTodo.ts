import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Create new todo for current user
  const todoRequest: CreateTodoRequest = JSON.parse(event.body)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const item = createTodo(todoRequest, jwtToken)
  
  return {
    statusCode: 201,
    body: JSON.stringify({
      item
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)