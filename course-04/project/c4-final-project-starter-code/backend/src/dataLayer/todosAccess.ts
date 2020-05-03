import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'
import { TodoUpdate } from '../models/TodoUpdate'
import * as AWS from 'aws-sdk'

const logger = createLogger('auth')

export class TodoAccess {
  constructor(
    private readonly dynamoDBClient: DocumentClient = new DocumentClient(),
    private readonly s3 = new AWS.S3({ signatureVersion: 'v4' }),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
  }

  async getTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos for user', { userId })

    const result = await this.dynamoDBClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  createTodo(item: TodoItem): TodoItem {
    logger.info('Creating new todo', { item })
    this.dynamoDBClient.put({
      TableName: this.todosTable,
      Item: item
    }).send()

    return item
  }

  updateTodo(todoId: string, todoUpdate: TodoUpdate, userId: string) {
    logger.info('Updating todo', { todoId, todoUpdate, userId })
    this.dynamoDBClient.update({
      TableName: this.todosTable,
      Key: {
          "userId": userId,
          "todoId": todoId
      },
      UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
      ExpressionAttributeNames: {"#name": "name"},
      ExpressionAttributeValues: {
        ":name": todoUpdate.name,
        ":dueDate": todoUpdate.dueDate,
        ":done": todoUpdate.done
      }
    }).send()
  }

  deleteTodo(todoId: string, userId: string) {
    logger.info('Deleting todo', { todoId, userId })
    this.dynamoDBClient.delete({
      TableName: this.todosTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      }
    }).send()
  }

  generateUploadURL(todoId: string, userId: string): string {
    logger.info('Updating todo with attachment URL', { todoId, userId })
    this.dynamoDBClient.update({
      TableName: this.todosTable,
      Key: {
          "userId": userId,
          "todoId": todoId
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
        ":attachmentUrl": `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
      }
    }).send()

    logger.info('Generating upload URL', { todoId, userId })
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
  }

}