import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

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
    logger.info('Creating new todo', { item })
    await this.dynamoDBClient.put({
      TableName: this.todosTable,
      Item: item
    }).promise()

    return item
  }

  async updateTodo(
    todoId: string,
    updateTodoRequest: UpdateTodoRequest, 
    userId: string) {
    logger.info('Updating todo', { todoId, updateTodoRequest, userId })
    await this.dynamoDBClient.update({
      TableName: this.todosTable,
      Key: {
          "userId": userId,
          "todoId": todoId
      },
      UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
      ExpressionAttributeNames: {"#name": "name"},
      ExpressionAttributeValues: {
        ":name": updateTodoRequest.name,
        ":dueDate": updateTodoRequest.dueDate,
        ":done": updateTodoRequest.done
      }
    }).promise();
  }

}