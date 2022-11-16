import * as uuid from 'uuid';
import * as AWS_SDK from 'aws-sdk';
import * as AWS_XRay from 'aws-xray-sdk';

import { TodoItem } from '../models/TodoItem';
import { Todo } from '../dataLayer/todos';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { getUserId } from '../lambda/utils';
import { createLogger } from '../utils/logger';

// xray import
const XRAY_AWS_CONST = AWS_XRay.captureAWS(AWS_SDK);

const bucketTodoApps = process.env.S3_BUCKET;
const expirationTime: number = 600;

//service
const todoItem = new Todo();

// s3 declare
const s3Bucket = new XRAY_AWS_CONST.S3({
  signatureVersion: 'v4',
});

//create todo
const createTodoItem = async (event: any): Promise<TodoItem> => {
  // todo request
  const todo: CreateTodoRequest = JSON.parse(event.body);
  // get user
  const accountId = getUserId(event);
  const todoId = uuid.v4();

  return await todoItem.createTodoItem({ todoId: todoId, userId: accountId, ...todo } as TodoItem);
};

// get list todo
const getAllTodos = async (event: any): Promise<TodoItem[]> => {
  // get user to get list for every user
  const accountId = getUserId(event);
  return await todoItem.getAllTodosItems(accountId);
};
// delete todo
const deleteTodoItem = async (event: any): Promise<void> => {
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);
  await todoItem.deleteTodo({ todoId: todoId, userId: userId });
};

// check todo is existed
const todoExistsInDb = async (event: any) => {
  // get id in request
  const todoId = event.pathParameters.todoId;
  // get user info
  const accountId = getUserId(event);
  const item = await todoItem.getTodo(todoId, accountId);
  // if item is existed -> item != undefine

  if (item) {
    return true;
  }
  return false;
};

// upload todo
const updateTodoItem = async (event: any): Promise<void> => {
  // get user info
  const accountId = getUserId(event);

  // get id form request
  const id = event.pathParameters.todoId;

  const updatedItem: UpdateTodoRequest = JSON.parse(event.body);

  return await todoItem.updateTodoItem({
    todoId: id,
    userId: accountId,
    ...updatedItem,
  } as TodoItem);
};

// get url link image in s3
const getUploadUrlLink = async (event: any): Promise<any> => {
  // get id in request
  const todoId = event.pathParameters.todoId;
  // get user info
  const accountId = getUserId(event);
  const signUrl = s3Bucket.getSignedUrl('putObject', {
    Bucket: bucketTodoApps,
    Key: todoId,
    Expires: expirationTime,
  });

  if (signUrl) {
    const attachmentUrl = `https://${bucketTodoApps}.s3.amazonaws.com/${todoId}`;
    await todoItem.updateTodoAttachment({
      todoId: todoId,
      userId: accountId,
      attachmentUrl: attachmentUrl,
    } as TodoItem);
    return signUrl;
  } else {
    createLogger(`s3 error`);
  }
};

export {
  createTodoItem,
  getAllTodos,
  deleteTodoItem,
  todoExistsInDb,
  updateTodoItem,
  getUploadUrlLink,
};
