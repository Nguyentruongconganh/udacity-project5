import * as uuid from 'uuid';
import * as AWS_SDK from 'aws-sdk';
import * as AWS_XRay from 'aws-xray-sdk';

import { BookItem } from '../models/BookItem';
import { Book } from '../dataLayer/books';
import { CreateBookRequest } from '../requests/CreateBookRequest';
import { UpdateBookRequest } from '../requests/UpdateBookRequest';
import { getUserId } from '../lambda/utils';
import { createLogger } from '../utils/logger';

// xray import
const XRAY_AWS_CONST = AWS_XRay.captureAWS(AWS_SDK);

const bucketBookApps = process.env.S3_BUCKET;
const expirationTime: number = 600;

//service
const bookItem = new Book();

// s3 declare
const s3Bucket = new XRAY_AWS_CONST.S3({
  signatureVersion: 'v4',
});

//create book
const createBookItem = async (event: any): Promise<BookItem> => {
  // book request
  const book: CreateBookRequest = JSON.parse(event.body);
  // get user
  const accountId = getUserId(event);
  const bookId = uuid.v4();

  return await bookItem.createBookItem({ bookId: bookId, userId: accountId, ...book } as BookItem);
};

// get list book
const getAllBooks = async (event: any): Promise<BookItem[]> => {
  // get user to get list for every user
  const accountId = getUserId(event);
  return await bookItem.getAllBooksItems(accountId);
};
// delete book
const deleteBookItem = async (event: any): Promise<void> => {
  const bookId = event.pathParameters.todoId;
  const userId = getUserId(event);
  await bookItem.deleteBook({ bookId: bookId, userId: userId });
};

// check book is existed
const bookExistsInDb = async (event: any) => {
  // get id in request
  const bookId = event.pathParameters.bookId;
  // get user info
  const accountId = getUserId(event);
  const item = await bookItem.getBook(bookId, accountId);
  // if item is existed -> item != undefine

  if (item) {
    return true;
  }
  return false;
};

// upload book
const updateBookItem = async (event: any): Promise<void> => {
  // get user info
  const accountId = getUserId(event);

  // get id form request
  const id = event.pathParameters.bookId;

  const updatedItem: UpdateBookRequest = JSON.parse(event.body);

  return await bookItem.updateBookItem({
    bookId: id,
    userId: accountId,
    ...updatedItem,
  } as BookItem);
};

// get url link image in s3
const getUploadUrlLink = async (event: any): Promise<any> => {
  // get id in request
  const bookId = event.pathParameters.bookId;
  // get user info
  const accountId = getUserId(event);
  const signUrl = s3Bucket.getSignedUrl('putObject', {
    Bucket: bucketBookApps,
    Key: bookId,
    Expires: expirationTime,
  });

  if (signUrl) {
    const attachmentUrl = `https://${bucketBookApps}.s3.amazonaws.com/${bookId}`;
    await bookItem.updateBookAttachment({
      bookId: bookId,
      userId: accountId,
      attachmentUrl: attachmentUrl,
    } as BookItem);
    return signUrl;
  } else {
    createLogger(`s3 error`);
  }
};

export {
  createBookItem,
  getAllBooks,
  deleteBookItem,
  bookExistsInDb,
  updateBookItem,
  getUploadUrlLink,
};
