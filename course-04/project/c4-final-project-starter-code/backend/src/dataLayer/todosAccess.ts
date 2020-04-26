import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'

const logger = createLogger('auth')

export class TodoAccess {

  constructor(
    private readonly dynamoDBClient: DocumentClient = new DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE) {
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

  async createTodo(item: TodoItem): Promise<TodoItem> {
    await this.dynamoDBClient.put({
      TableName: this.todosTable,
      Item: item
    }).promise()

    return item
  }
}