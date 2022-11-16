import * as AWS_SDK from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import * as AWS_XRay from 'aws-xray-sdk';
import { TodoItem } from '../models/TodoItem';
import { createLogger } from '../utils/logger';

const XRAY_AWS = AWS_XRay.captureAWS(AWS_SDK);

export class Todo {
  constructor(
    private readonly docClientDb: DocumentClient = createDynamoDBClient(),
    private readonly tableTodos = process.env.DB_TODOS_TABLE
  ) {}

  // get todo
  getTodo = async (todoId: string, userId: string) => {
    const doc = await this.docClientDb
      .get({
        TableName: this.tableTodos,
        Key: {
          todoId,
          userId,
        },
      })
      .promise();

    return doc.Item;
  };

  // create todo
  createTodoItem = async (data: TodoItem): Promise<TodoItem> => {
    const model = {
      todoId: data.todoId,
      userId: data.userId,
      ...data,
    };

    //write to bd
    try {
      await this.docClientDb
        .put({
          TableName: this.tableTodos,
          Item: model,
        })
        .promise();
    } catch (err) {
      createLogger(`Log Error created todo item: ${err}`);
    }
    return model;
  };

  // get list todo in db
  getAllTodosItems = async (userId: string): Promise<TodoItem[]> => {
    const request = {
      TableName: this.tableTodos,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false,
    };
    // query result
    const result = await this.docClientDb.query(request).promise();

    //return value
    return result.Items as TodoItem[];
  };

  // update todo
  updateTodoItem = async (data: TodoItem): Promise<void> => {
    try {
      await this.docClientDb
        .update({
          TableName: this.tableTodos,
          Key: {
            todoId: data.todoId,
            userId: data.userId,
          },
          ExpressionAttributeNames: {
            '#N': 'name',
          },
          UpdateExpression: 'SET #N = :name, dueDate = :dueDate, done = :done',
          ExpressionAttributeValues: {
            ':name': data.name,
            ':dueDate': data.dueDate,
            ':done': data.done,
          },
        })
        .promise();
    } catch (err) {
      createLogger(`Log Error update todo item: ${err}`);
    }
  };

  // update todo with image
  updateTodoAttachment = async (data: TodoItem): Promise<void> => {
    try {
      await this.docClientDb
        .update({
          TableName: this.tableTodos,
          Key: {
            todoId: data.todoId,
            userId: data.userId,
          },
          UpdateExpression: 'SET attachmentUrl = :attachment',
          ExpressionAttributeValues: {
            ':attachment': data.attachmentUrl,
          },
        })
        .promise();
    } catch (err) {
      createLogger(`Log Error update todo item with URL: ${err}`);
    }
  };

  //delete todo
  deleteTodo = async (data: TodoItem): Promise<void> => {
    try {
      await this.docClientDb
        .delete({
          TableName: this.tableTodos,
          Key: {
            todoId: data.todoId,
            userId: data.userId,
          },
        })
        .promise();
    } catch (err) {
      createLogger(`Log Error deleting todo item: ${err}`);
    }
  };
}

// create table
const createDynamoDBClient = () => {
  // code for create table
  return new XRAY_AWS.DynamoDB.DocumentClient({
    signatureVersion: 'v4',
  });
};

export { createDynamoDBClient };
