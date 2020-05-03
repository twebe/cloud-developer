import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { generateUploadURL } from '../../businessLogic/todos';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Return a presigned URL to upload a file for a TODO item with the provided id
  const todoId = event.pathParameters.todoId
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const url = generateUploadURL(todoId, jwtToken)
  
  return {
    statusCode: 201,
    body: JSON.stringify({
      uploadUrl: url
    })
  }
});

handler.use(
  cors({
    credentials: true
  })
)