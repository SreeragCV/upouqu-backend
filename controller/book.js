const { isNotEmpty, isNumber } = require("../utils/validation");
const pool = require("../config/dbconfig");
const { s3UploadV3 } = require("../S3Bucket/s3Service");

// create-book #######################################################################################################################
module.exports.contributeBook = async function (req, res) {
  try {
    const { book_name, genre, price, description } = req.body;

    const file = req.files;
    const genres = genre.split(",");

    const validImage = file.image[0].mimetype.split("/")[0] === "image";
    const validPdf = file.book[0].mimetype === "application/pdf";
    const limitedImages = file.image.length === 1;
    const limitedPdfs = file.book.length === 1;

    const fileErrors = {};

    if (!validImage) {
      fileErrors.image = "Invalid Image format..";
    }

    if (!validPdf) {
      fileErrors.book = "Invalid PDF format..";
    }

    if (!limitedImages) {
      fileErrors.imageCount = "Can only upload one Image!";
    }

    if (!limitedPdfs) {
      fileErrors.bookCount = "Can only upload one PDF!";
    }

    if (Object.keys(fileErrors).length > 0) {
      return res.status(422).json(fileErrors);
    }

    let errors = { message: "Validation Errors!" };

    if (!isNotEmpty(book_name)) {
      errors.book_name = "Invalid Details, must give a book name";
    }

    if (genres.length < 0) {
      errors.genre = "Invalid Details, must give a genre";
    }

    if (!isNumber(price)) {
      errors.price = "Invalid Details, price must be a number";
    }

    if (!isNotEmpty(description)) {
      errors.description = "Invalid Details, must give a description";
    }

    if (Object.keys(errors).length > 1) {
      return res.status(422).json(errors);
    }

    const files = [file.image[0], file.book[0]];

    const { params } = await s3UploadV3(files);

    let image_url = `https://upouqu-bucket.s3.amazonaws.com/`;
    let pdf_url = "https://upouqu-bucket.s3.amazonaws.com/";

    const imageExtensions = [".jpg", ".jpeg", ".png"];
    const pdfExtensions = [".pdf"];

    const imageUrlFilter = params.find((param) => {
      const extension = param.Key.slice(
        param.Key.lastIndexOf(".")
      ).toLowerCase();
      return imageExtensions.includes(extension);
    });

    const pdfUrlFilter = params.find((param) => {
      const extension = param.Key.slice(
        param.Key.lastIndexOf(".")
      ).toLowerCase();
      return pdfExtensions.includes(extension);
    });

    image_url += imageUrlFilter?.Key;
    pdf_url += pdfUrlFilter?.Key;

    const newBook = await pool.query(
      `INSERT INTO Books (book_name, price, image_url, pdf_url, genre, description, user_id) VALUES($1, $2, $3, $4, $5::TEXT[], $6, $7) RETURNING *`,
      [book_name, price, image_url, pdf_url, genres, description, req.user_id]
    );

    const book_id = newBook.rows[0].book_id;

    return res.json({ message: "Book Uploaded Successfully", book_id });
  } catch (e) {
    return res.json({ message: "Server Error" });
  }
};

exports.totalBookCount = async (req, res) => {
  const totalBooks = await pool.query(`SELECT COUNT(book_id) FROM Books;`);
  if (totalBooks.rowCount === 0) {
    return res.status(404).json({ message: "No Books Found" });
  }
  return res.status(200).json(totalBooks);
};

// book-genres  #####################################################################################################################
exports.getBooksByQuery = async (req, res, next) => {
  try {
    const { genre } = req.query;
    const getBooks = await pool.query(
      `SELECT * FROM Books WHERE '${genre}' = ANY (genre);`
    );
    return res.status(200).json({ books: getBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// book-details  #####################################################################################################################
exports.getBookDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const findBook = await pool.query(
      `SELECT * FROM Books WHERE book_id='${id}';`
    );
    if (findBook.rows.length === 0) {
      return res.status(404).json({ message: "Book Not Found!" });
    }

    const bookDetails = findBook.rows[0];
    const userId = bookDetails.user_id;

    const user = await pool.query(
      `SELECT username, full_name, email, user_id FROM Users WHERE user_id='${userId}';`
    );

    const userDetails = user.rows[0];

    return res.status(200).json({
      bookDetails,
      userDetails,
      message: "Success, here is your book details!",
    });
  } catch (e) {
    return res.status(500).json({ message: "Server Error!" });
  }
};

// book-deletion ####################################################################################################################
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const findBook = await pool.query(
      `SELECT user_id FROM Books WHERE book_id='${id}';`
    );
    if (findBook.rows[0].user_id !== req.user_id) {
      res.status(401).json({ message: "Unauthorized!" });
    }
    const deleteBook = await pool.query(
      `DELETE FROM Books WHERE book_id='${id}';`
    );
    if (deleteBook.rowCount === 1) {
      return res
        .status(200)
        .json({ message: "Successfully Deleted!", status: true });
    }
  } catch (e) {
    return res.status(500).json({ message: "Server Error!" });
  }
};

// book-update #########################################################################################################################
exports.updateBook = async (req, res) => {
  try {
    const id = req.params.id;

    const { book_name, genre, price, description, image, book } = req.body;
    const genres = genre.split(",");

    const file = req.files;

    // no file changed ------------------------------------------------------
    if (book_name && genre && price && description && image && book) {
      const updatedBook = await pool.query(
        `
        UPDATE Books
        SET book_name = $1, price = $2, image_url = $3, pdf_url = $4, genre = $5, description = $6, user_id = $7
        WHERE book_id = $8
        RETURNING *;
        `,
        [book_name, price, image, book, genres, description, req.user_id, id]
      );
      const book_id = updatedBook.rows[0].book_id;

      return res.status(200).json({ message: "post updated!", book_id });
    }

    // image file changed ---------------------------------------------------------
    if (file.image && !file.book) {
      const validImage = file.image[0].mimetype.split("/")[0] === "image";
      const limitedImages = file.image.length === 1;

      const fileErrors = {};

      if (!validImage) {
        fileErrors.image = "Invalid Image format..";
      }

      if (!limitedImages) {
        fileErrors.imageCount = "Can only upload one Image!";
      }

      if (Object.keys(fileErrors).length > 0) {
        return res.status(422).json(fileErrors);
      }
      const files = [file.image[0]];

      const { params } = await s3UploadV3(files);

      let image_url = `https://upouqu-bucket.s3.amazonaws.com/`;

      const imageExtensions = [".jpg", ".jpeg", ".png"];

      const imageUrlFilter = params.find((param) => {
        const extension = param.Key.slice(
          param.Key.lastIndexOf(".")
        ).toLowerCase();
        return imageExtensions.includes(extension);
      });

      image_url += imageUrlFilter?.Key;

      const updatedBook = await pool.query(
        `
      UPDATE Books
      SET book_name = $1, price = $2, image_url = $3, pdf_url = $4, genre = $5, description = $6, user_id = $7
      WHERE book_id = $8
      RETURNING *;
      `,
        [
          book_name,
          price,
          image_url,
          book,
          genres,
          description,
          req.user_id,
          id,
        ]
      );

      const book_id = updatedBook.rows[0].book_id;
      console.log(id);

      return res.status(200).json({ message: "post updated!", book_id });
    }

    // pdf file changed ---------------------------------------------------------------
    if (!file.image && file.book) {
      const validPdf = file.book[0].mimetype === "application/pdf";
      const limitedPdfs = file.book.length === 1;

      const fileErrors = {};

      if (!validPdf) {
        fileErrors.book = "Invalid PDF format..";
      }

      if (!limitedPdfs) {
        fileErrors.bookCount = "Can only upload one PDF!";
      }

      if (Object.keys(fileErrors).length > 0) {
        return res.status(422).json(fileErrors);
      }

      const files = [file.book[0]];

      const { params } = await s3UploadV3(files);

      let pdf_url = "https://upouqu-bucket.s3.amazonaws.com/";

      const pdfExtensions = [".pdf"];

      const pdfUrlFilter = params.find((param) => {
        const extension = param.Key.slice(
          param.Key.lastIndexOf(".")
        ).toLowerCase();
        return pdfExtensions.includes(extension);
      });

      pdf_url += pdfUrlFilter?.Key;

      const updatedBook = await pool.query(
        `
      UPDATE Books
      SET book_name = $1, price = $2, image_url = $3, pdf_url = $4, genre = $5, description = $6, user_id = $7
      WHERE book_id = $8
      RETURNING *;
      `,
        [book_name, price, image, pdf_url, genres, description, req.user_id, id]
      );

      const book_id = updatedBook.rows[0].book_id;

      return res.status(200).json({ message: "post updated!", book_id });
    }

    // both file changed --------------------------------------------------------------
    if (file && file.image[0] && file.book[0]) {
      const validImage = file.image[0].mimetype.split("/")[0] === "image";
      const validPdf = file.book[0].mimetype === "application/pdf";
      const limitedImages = file.image.length === 1;
      const limitedPdfs = file.book.length === 1;

      const fileErrors = {};

      if (!validImage) {
        fileErrors.image = "Invalid Image format..";
      }

      if (!validPdf) {
        fileErrors.book = "Invalid PDF format..";
      }

      if (!limitedImages) {
        fileErrors.imageCount = "Can only upload one Image!";
      }

      if (!limitedPdfs) {
        fileErrors.bookCount = "Can only upload one PDF!";
      }

      if (Object.keys(fileErrors).length > 0) {
        return res.status(422).json(fileErrors);
      }

      const files = [file.image[0], file.book[0]];

      const { params } = await s3UploadV3(files);

      let image_url = `https://upouqu-bucket.s3.amazonaws.com/`;
      let pdf_url = "https://upouqu-bucket.s3.amazonaws.com/";

      const imageExtensions = [".jpg", ".jpeg", ".png"];
      const pdfExtensions = [".pdf"];

      const imageUrlFilter = params.find((param) => {
        const extension = param.Key.slice(
          param.Key.lastIndexOf(".")
        ).toLowerCase();
        return imageExtensions.includes(extension);
      });

      const pdfUrlFilter = params.find((param) => {
        const extension = param.Key.slice(
          param.Key.lastIndexOf(".")
        ).toLowerCase();
        return pdfExtensions.includes(extension);
      });

      image_url += imageUrlFilter?.Key;
      pdf_url += pdfUrlFilter?.Key;

      const updatedBook = await pool.query(
        `
      UPDATE Books
      SET book_name = $1, price = $2, image_url = $3, pdf_url = $4, genre = $5, description = $6, user_id = $7
      WHERE book_id = $8
      RETURNING *;
      `,
        [
          book_name,
          price,
          image_url,
          pdf_url,
          genres,
          description,
          req.user_id,
          id,
        ]
      );

      const book_id = updatedBook.rows[0].book_id;

      return res.status(200).json({ message: "post updated!", book_id });
    }
  } catch (e) {}
};
