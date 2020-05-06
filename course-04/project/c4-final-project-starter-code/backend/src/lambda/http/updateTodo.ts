import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/todos'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Update a TODO item with the provided id using values in the "updatedTodo" object
  const todoId = event.pathParameters.todoId
  const updatedTodoRequest: UpdateTodoRequest = JSON.parse(event.body)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  
  updateTodo(todoId, updatedTodoRequest, jwtToken)

  return {
    statusCode: 200,
    body: ""
  }
})

handler.use(
  cors({
    credentials: true
  })
)