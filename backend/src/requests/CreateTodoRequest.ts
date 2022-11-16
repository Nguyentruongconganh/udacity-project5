/**
 * Fields in a request to create a single TODO item.
 */
export interface CreateTodoRequest {
  name: string;
  dueDate: string;
  // field for model item
  createdAt?: string;
  done?: boolean;
  attachmentUrl?: string;
}
