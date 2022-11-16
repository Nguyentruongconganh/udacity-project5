/**
 * Fields in a request to update a single Book item.
 */
export interface UpdateBookRequest {
  name: string;
  content: string;
  title: string;
  author: string;
  publicDate: string;
  myFavorite: boolean;
}
