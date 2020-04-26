import * as uuid from 'uuid'

import { TodoAccess } from '../dataLayer/todosAccess'
import { TodoItem } from '../models/TodoItem'
import { parseUserId } from '../auth/utils'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const todosAccess = new TodoAccess()

export async function getTodos(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken)
    return todosAccess.getTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)
  return await todosAccess.createTodo({
    todoId: todoId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    createdAt: new Date().toISOString()
  })
}