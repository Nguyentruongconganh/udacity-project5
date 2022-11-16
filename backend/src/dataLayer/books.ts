import * as AWS_SDK from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import * as AWS_XRay from 'aws-xray-sdk';
import { BookItem } from '../models/BookItem';
import { createLogger } from '../utils/logger';

const XRAY_AWS = AWS_XRay.captureAWS(AWS_SDK);

export class Book {
  constructor(
    private readonly docClientDb: DocumentClient = createDynamoDBClient(),
    private readonly tableBooks = process.env.DB_TODOS_TABLE_BOOK
  ) {}

  // get book
  getBook = async (bookId: string, userId: string) => {
    const doc = await this.docClientDb
      .get({
        TableName: this.tableBooks,
        Key: {
          bookId,
          userId,
        },
      })
      .promise();

    return doc.Item;
  };

  // create book
  createBookItem = async (data: BookItem): Promise<BookItem> => {
    const model = {
      bookId: data.bookId,
      userId: data.userId,
      ...data,
    };

    //write to bd
    try {
      await this.docClientDb
        .put({
          TableName: this.tableBooks,
          Item: model,
        })
        .promise();
    } catch (err) {
      createLogger(`Log Error created book item: ${err}`);
    }
    return model;
  };

  // get list book in db
  getAllBooksItems = async (userId: string): Promise<BookItem[]> => {
    const request = {
      TableName: this.tableBooks,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false,
    };
    // query result
    const result = await this.docClientDb.query(request).promise();

    //return value
    return result.Items as BookItem[];
  };

  // update book
  updateBookItem = async (data: BookItem): Promise<void> => {
    try {
      await this.docClientDb
        .update({
          TableName: this.tableBooks,
          Key: {
            bookId: data.bookId,
            userId: data.userId,
          },
          ExpressionAttributeNames: {
            '#N': 'name',
          },
          UpdateExpression: 'SET #N = :name, publicDate = :publicDate, myFavorite = :myFavorite',
          ExpressionAttributeValues: {
            ':name': data.name,
            ':publicDate': data.publicDate,
            ':myFavorite': data.myFavorite,
            ':author': data.author,
            ':title': data.title,
            ':content': data.content,
          },
        })
        .promise();
    } catch (err) {
      createLogger(`Log Error update book item: ${err}`);
    }
  };

  // update book with image
  updateBookAttachment = async (data: BookItem): Promise<void> => {
    try {
      await this.docClientDb
        .update({
          TableName: this.tableBooks,
          Key: {
            bookId: data.bookId,
            userId: data.userId,
          },
          UpdateExpression: 'SET attachmentUrl = :attachment',
          ExpressionAttributeValues: {
            ':attachment': data.attachmentUrl,
          },
        })
        .promise();
    } catch (err) {
      createLogger(`Log Error update book item with URL: ${err}`);
    }
  };

  //delete book
  deleteBook = async (data: BookItem): Promise<void> => {
    try {
      await this.docClientDb
        .delete({
          TableName: this.tableBooks,
          Key: {
            bookId: data.bookId,
            userId: data.userId,
          },
        })
        .promise();
    } catch (err) {
      createLogger(`Log Error deleting book item: ${err}`);
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
