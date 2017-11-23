import { Book, BorrowedBook, BookCategory, Notification } from '../models';
import { getQuery, getOptions, paginate } from '../helpers/pagination';


const bookController = {
  /**
   * Add new book category to library.
   * @public
   * @method
   * @param  {object} req - express http request object
   * @param  {object} res - express http response object
   * @return {Object}     - express http response object
   */
  addCategory(req, res) {
    if (req.user && req.user.isAdmin) {
      return BookCategory
        .create(req.body)
        .then(category => (res.status(201).send({
          message:
            `Successfully added new category, ${category.category}, to Library`,
        })))
        .catch(error => res.status(500).send({
          error
        }));
    }
    res.status(401).send({
      message: 'Unauthorized access',
    });
  },
  /**
   * Fetch Book Categories.
   * @public
   * @method
   * @param  {object} req - express http request object
   * @param  {object} res - express http response object
   * @return {Object}     - express http response object
   */
  getBookCategories(req, res) {
    BookCategory.findAll({ attributes: ['id', 'category'] })
      .then(categories => (
        res.status(200).send({
          categories,
        })
      ))
      .catch(error => res.status(500).send({
        error
      }));
  },

  /**
   * Add new book to library.
   * @public
   * @method
   * @param  {object} req - express http request object
   * @param  {object} res - express http response object
   * @return {Object}     - express http response object
   */
  createBook(req, res) {
    return Book
      .create(req.body)
      .then(book => res.status(201).send({
        message: `Successfully added ${book.title} to Library`,
        book,
      }))
      .catch(error => res.status(500).send({
        error
      }));
  },

  /**
   * Fetch a specific book
   * @public
   * @method
   * @param  {object} req - express http request object
   * @param  {object} res - express http response object
   * @return {Object}     - express http response object
   */
  getBook(req, res) {
    const id = Number(req.params.id);
    Book.findById(id)
      .then((book) => {
        if (!book) {
          return res.status(404).send({
            message: 'Book not found',
          });
        }
        res.status(200).send({
          book,
        });
      })
      .catch(error => res.status(500).send({
        error
      }));
  },

  /**
   * Fetch all books present in database
   * @public
   * @method
   * @param  {object} req - express http request object
   * @param  {object} res - express http response object
   * @return {Object}     - express http response object
   */
  getBooks(req, res) {
    const query = getQuery(req);
    const options = getOptions(req);
    Book.findAndCountAll({ where: query, ...options })
      .then((result) => {
        if (!result.count) {
          if (req.query.search || req.query.categoryId) {
            return res.status(200).send({
              books: [],
              message: 'No book matched your request'
            });
          }
          return res.status(200).send({
            books: [],
            message: 'Library is currently empty. Check back later'
          });
        }
        res.status(200).send({
          books: result.rows,
          metadata: paginate(result.count,
            Number(options.limit), options.offset)
        });
      })
      .catch(error => res.status(500).send({ error }));
  },

  /**
   * Edit a book's metadata.
   * @public
   * @method
   * @param  {object} req - express http request object
   * @param  {object} res - express http response object
   * @return {Object}     - express http response object
   */
  editBookInfo(req, res) {
    const id = req.params.id;
    Book.update(
      req.body,
      {
        where: { id },
        returning: true,
        plain: true,
      })
      .then(book => res.status(200).send({
        book: book[1],
        message: `${book[1].title} was successfully updated`
      }))
      .catch(error => res.status(500).send({
        error,
      }));
  },

  /**
   * Delete a book from database.
   * @public
   * @method
   * @param  {object} req - express http request object
   * @param  {object} res - express http response object
   * @return {Object}     - express http response object
   */
  deleteBook(req, res) {
    const id = req.params.id;
    Book.destroy({ where: { id } })
      .then(() => res.status(200).send({
        message: 'Successfully deleted book from database',
      }))
      .catch(error => res.status(500).send({
        error,
      }));
  },

  /**
   * Allow user borrow book.
   * @public
   * @method
   * @param  {object} req - express http request object
   * @param  {object} res - express http response object
   * @return {Object}     - express http response object
   */
  borrowBook(req, res) {
    const userId = req.params.id;
    const bookId = req.body.id;
    Book.findById(bookId)
      .then((book) => {
        if (!book) {
          return res.status(404).send({
            message: 'Book not found',
          });
        }
        if (book.total <= 0) {
          return res.status(404).send({
            message: 'There are no available copies of this book at this time',
          });
        }
        BorrowedBook.findOne({ where: { userId, bookId } })
          .then((borrowed) => {
            if (borrowed && borrowed.returned === false) {
              return res.status(403).send({
                message: 'You currently have this book.' +
                ' Return it before trying to borrow it again',
              });
            } else if (borrowed && borrowed.returned === true) {
              borrowed.returned = false;
              borrowed.save();
              book.total -= 1;
              book.save();
              const notification = new Notification({
                type: 'borrow',
                bookTitle: book.title,
                username: req.user.username,
              });
              notification.save();
              return res.status(200).send({
                message: `You have successfully borrowed ${book.title} ` +
                'again. Check your dashboard to read it',
              });
            }
            BorrowedBook.create({
              userId, bookId,
            })
              .then(() => {
                book.total -= 1;
                book.save(); // wait till book is saved before sending response
                const notification = new Notification({
                  type: 'borrow',
                  bookTitle: book.title,
                  username: req.user.username,
                });
                notification.save();
              })
              .then(() => res.status(200).send({
                message: `You have successfully borrowed ${book.title}` +
                'again. Check your dashboard to read it',
              }))
              .catch(error => (
                res.status(500).send({
                  error
                })
              ));
          });
      })
      .catch(error => res.status(500).send({
        error,
      }));
  },

  /**
   * Allow user return borrowed book.
   * @public
   * @method
   * @param  {object} req - express http request object
   * @param  {object} res - express http response object
   * @return {Object}     - express http response object
   */
  returnBook(req, res) {
    const bookId = req.body.id;
    const userId = req.params.id;
    BorrowedBook.findOne({ where: { userId, bookId, returned: false } })
      .then((borrowedBook) => {
        if (borrowedBook) {
          return BorrowedBook.update({
            returned: true,
          }, {
            where: { userId, bookId, returned: false }
          }).then(() => {
            Book.findById(bookId)
              .then((book) => {
                book.total += 1;
                book.save();
                return book;
              })
              .then((book) => {
                const notification = new Notification({
                  type: 'return',
                  bookTitle: book.title,
                  username: req.user.username,
                });
                notification.save();
                res.status(200).send({
                  message: `You have successfully returned ${book.title}`,
                });
              });
          });
        }
        return res.status(400).send({
          message: 'This book is currently not on your list.' +
          ' You have either returned it or never borrowed it'
        });
      })
      .catch(error => res.status(500).send({
        error,
      }));
  }
};

export default bookController;
