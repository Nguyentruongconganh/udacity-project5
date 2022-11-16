import dateFormat from 'dateformat'
import React from 'react'
import { Form } from 'semantic-ui-react'
import Auth from '../../auth/Auth'

interface BooksProps {
  auth: Auth
  onChange: any
}

class BookForm extends React.PureComponent<BooksProps> {
  state = { name: '', title: '', author: '', content: '' }

  handleChange = (e: any, { name, value }: any) => {
    this.setState({ [name]: value })
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }

  handleSubmit = async () => {
    this.props.onChange({ ...this.state })
    this.clear()
  }

  clear = () => {
    this.setState({ name: '', title: '', author: '', content: '' })
  }

  render() {
    const { name, title, author, content } = this.state

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group widths="equal">
            <Form.Input
              required
              fluid
              label="name"
              name="name"
              placeholder="book name"
              value={name}
              onChange={this.handleChange}
            />
            <Form.Input
              required
              fluid
              label="title"
              name="title"
              placeholder="book title"
              value={title}
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Input
              required
              fluid
              label="author"
              name="author"
              placeholder="book author"
              value={author}
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.TextArea
            required
            label="content"
            name="content"
            placeholder="book content..."
            value={content}
            onChange={this.handleChange}
          />

          <Form.Button>Submit</Form.Button>
        </Form>
      </div>
    )
  }
}

export default BookForm
