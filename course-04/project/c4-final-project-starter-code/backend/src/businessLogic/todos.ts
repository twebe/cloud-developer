import { TodoAccess } from '../dataLayer/todosAccess'
import { TodoItem } from '../models/TodoItem'
import { parseUserId } from '../auth/utils'

const todosAccess = new TodoAccess()

export async function getTodos(jwtToken: string): Promise<TodoItem[]> {
    return todosAccess.getTodos(parseUserId(jwtToken))
  }