import * as uuid from 'uuid'

import { TodoAccess } from '../dataLayer/todosAccess'
import { TodoItem } from '../models/TodoItem'
import { parseUserId } from '../auth/utils'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'

const todosAccess = new TodoAccess()

export async function getTodos(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken)
    return todosAccess.getTodos(userId)
}

export function createTodo(createTodoRequest: CreateTodoRequest, jwtToken: string): TodoItem {
  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)
  return todosAccess.createTodo({
    todoId: todoId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    createdAt: new Date().toISOString()
  })
}

export function updateTodo(todoId: string, updateTodoRequest: UpdateTodoRequest, jwtToken: string) {
  const userId = parseUserId(jwtToken)
  const todoUpdate: TodoUpdate = {
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  }
  todosAccess.updateTodo(todoId, todoUpdate, userId)
}

export async function deleteTodo(todoId: string, jwtToken: string) {
  const userId = parseUserId(jwtToken)
  todosAccess.deleteTodo(todoId, userId)
}

export function generateUploadURL(todoId: string, jwtToken: string): string {
  const userId = parseUserId(jwtToken)
  return todosAccess.generateUploadURL(todoId, userId)
}