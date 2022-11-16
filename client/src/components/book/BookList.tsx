import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Loader
} from 'semantic-ui-react'
import {
  createBook,
  deleteBook,
  getBooks,
  patchBook
} from '../../api/books-api'
import Auth from '../../auth/Auth'
import { Book } from '../../types/Book'
import BookForm from './BookForm'

interface BooksProps {
  auth: Auth
  history: History
}

interface BooksState {
  books: Book[]
  newBookName: string
  loadingBooks: boolean
}

export class Books extends React.PureComponent<BooksProps, BooksState> {
  state: BooksState = {
    books: [],
    newBookName: '',
    loadingBooks: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookName: event.target.value })
  }

  onEditButtonClick = (bookId: string) => {
    this.props.history.push(`/books/${bookId}/edit`)
  }

  onBookDelete = async (bookId: string) => {
    try {
      await deleteBook(this.props.auth.getIdToken(), bookId)
      this.setState({
        books: this.state.books.filter((book) => book.bookId !== bookId)
      })
    } catch {
      alert('Book deletion failed')
    }
  }

  onBookCheck = async (pos: number) => {
    try {
      const book = this.state.books[pos]
      await patchBook(this.props.auth.getIdToken(), book.bookId, {
        name: book.name,
        publicDate: book.publicDate,
        myFavorite: !book.myFavorite,
        author: book.author,
        content: book.content,
        title: book.title
      })
      this.setState({
        books: update(this.state.books, {
          [pos]: { myFavorite: { $set: !book.myFavorite } }
        })
      })
    } catch {
      alert('Book deletion failed')
    }
  }

  async componentDidMount() {
    this.getBookList()
  }

  getBookList = async () => {
    try {
      const books = await getBooks(this.props.auth.getIdToken())
      this.setState({
        books,
        loadingBooks: false
      })
    } catch (e) {
      //alert(`Failed to fetch books: ${e.message}`)
      let errorMessage = 'Failed to fetch books'
      if (e instanceof Error) {
        errorMessage = e.message
      }
      alert(errorMessage)
    }
  }

  render() {
    return (
      <div>
        <Grid columns={2} divided>
          <Grid.Row>
            <Grid.Column width={13}>
              <Header as="h1">BOOK MANAGEMENT</Header>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <BookForm
          auth={this.props.auth}
          onChange={(e: any) => this.handelSubmit(e)}
        ></BookForm>

        {this.renderBooks()}
      </div>
    )
  }

  handelSubmit = async (e: any) => {
    const publicDate = this.calculateDueDate()
    await createBook(this.props.auth.getIdToken(), {
      ...e,
      publicDate,
      createdAt: publicDate,
      myFavorite: false
    })
    this.getBookList()
  }

  renderBooks() {
    if (this.state.loadingBooks) {
      return this.renderLoading()
    }

    return this.renderBooksListGridView()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderBooksList() {
    return (
      <Grid padded>
        {(this.state.books?.length > 0 ? this.state.books : [])?.map(
          (book, pos) => {
            return (
              <Grid.Row key={book.bookId}>
                <Grid.Column width={1} verticalAlign="middle">
                  <Checkbox
                    onChange={() => this.onBookCheck(pos)}
                    checked={book.myFavorite}
                  />
                </Grid.Column>
                <Grid.Column width={10} verticalAlign="middle">
                  {book.name}
                </Grid.Column>
                <Grid.Column width={3} floated="right">
                  {book.publicDate}
                </Grid.Column>
                <Grid.Column width={1} floated="right">
                  <Button
                    icon
                    color="blue"
                    onClick={() => this.onEditButtonClick(book.bookId)}
                  >
                    <Icon name="pencil" />
                  </Button>
                </Grid.Column>
                <Grid.Column width={1} floated="right">
                  <Button
                    icon
                    color="red"
                    onClick={() => this.onBookDelete(book.bookId)}
                  >
                    <Icon name="delete" />
                  </Button>
                </Grid.Column>
                {book.attachmentUrl && (
                  <Image src={book.attachmentUrl} size="small" wrapped />
                )}
                <Grid.Column width={16}>
                  <Divider />
                </Grid.Column>
              </Grid.Row>
            )
          }
        )}
      </Grid>
    )
  }

  renderBooksListGridView() {
    return (
      <Grid columns="two">
        <Grid.Row>
          {(this.state.books?.length > 0 ? this.state.books : [])?.map(
            (book, pos) => {
              return (
                <Grid.Column>
                  <Card key={book?.bookId}>
                    <Image
                      src={
                        book?.attachmentUrl
                          ? book.attachmentUrl
                          : 'https://react.semantic-ui.com/images/avatar/large/matthew.png'
                      }
                      style={{ width: '290px', height: '300px' }}
                      wrapped
                      ui={false}
                    />
                    <Card.Content>
                      <Card.Header>{book?.title}</Card.Header>
                      <Card.Meta>
                        <span className="date">{book?.publicDate}</span>
                      </Card.Meta>
                      <Card.Description>{book?.author}</Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                      <div className="ui two buttons">
                        <Button
                          basic
                          color="green"
                          onClick={() => this.onEditButtonClick(book.bookId)}
                        >
                          EDIT
                        </Button>
                        <Button
                          basic
                          color="red"
                          onClick={() => this.onBookDelete(book.bookId)}
                        >
                          DELETE
                        </Button>
                      </div>
                    </Card.Content>
                  </Card>
                </Grid.Column>
              )
            }
          )}
        </Grid.Row>
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
