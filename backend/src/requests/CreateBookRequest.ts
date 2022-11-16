/**
 * Fields in a request to create a single TODO item.
 */
export interface CreateBookRequest {
  name: string;
  content?: string;
  createdAt?: string;
  title?: string;
  author?: string;
  publicDate?: string;
  myFavorite?: boolean;
  attachmentUrl?: string;
}
