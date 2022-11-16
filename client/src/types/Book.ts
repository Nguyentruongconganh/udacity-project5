export interface Book {
  userId: string
  bookId: string
  createdAt?: string
  name: string
  content: string
  title: string
  publicDate: string
  myFavorite?: boolean
  author: string
  attachmentUrl?: string
}
