const { isNotEmpty, isNumber } = require("../utils/validation");
const pool = require("../config/dbconfig");
const { s3UploadV3 } = require("../S3Bucket/s3Service");

// create-book
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

    return res.json({ message: "Book Uploaded Successfully" });
  } catch (e) {
    return res.json({ message: "Server Error" });
  }
};

// Horror
exports.getHorrorBooks = async (req, res) => {
  try {
    const horrorBooks = await pool.query(
      `SELECT * FROM Books WHERE 'Horror' = ANY (genre);`
    );
    return res.status(200).json({ books: horrorBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Action
exports.getActionBooks = async (req, res) => {
  try {
    const actionBooks = await pool.query(
      `SELECT * FROM Books WHERE 'Action' = ANY (genre);`
    );
    return res.status(200).json({ books: actionBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Thriller
exports.getThrillerBooks = async (req, res) => {
  try {
    const thrillerBooks = await pool.query(
      `SELECT * FROM Books WHERE 'Thriller' = ANY (genre);`
    );
    return res.status(200).json({ books: thrillerBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Romance
exports.getRomanceBooks = async (req, res) => {
  try {
    const romanceBooks = await pool.query(
      `SELECT * FROM Books WHERE 'Romance' = ANY (genre);`
    );
    return res.status(200).json({ books: romanceBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Psychology
exports.getPsychologyBooks = async (req, res) => {
  try {
    const psychologyBooks = await pool.query(
      `SELECT * FROM Books WHERE 'Psychology' = ANY (genre);`
    );
    return res
      .status(200)
      .json({ books: psychologyBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Novel
exports.getNovelBooks = async (req, res) => {
  try {
    const novelBooks = await pool.query(
      `SELECT * FROM Books WHERE 'Novel' = ANY (genre);`
    );
    return res.status(200).json({ books: novelBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Short Story
exports.getShortStoryBooks = async (req, res) => {
  try {
    const shortStoryBooks = await pool.query(
      `SELECT * FROM Books WHERE 'Short Story' = ANY (genre);`
    );
    return res
      .status(200)
      .json({ books: shortStoryBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Literature
exports.getLiteratureBooks = async (req, res) => {
  try {
    const literatureBooks = await pool.query(
      `SELECT * FROM Books WHERE 'Literature' = ANY (genre);`
    );
    return res
      .status(200)
      .json({ books: literatureBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// History
exports.getHistoryBooks = async (req, res) => {
  try {
    const historyBooks = await pool.query(
      `SELECT * FROM Books WHERE 'History' = ANY (genre);`
    );
    return res.status(200).json({ books: historyBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Fiction
exports.getFictionBooks = async (req, res) => {
  try {
    const fictionBooks = await pool.query(
      `SELECT * FROM Books WHERE 'Fiction' = ANY (genre);`
    );
    return res.status(200).json({ books: fictionBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Poetry
exports.getPoetryBooks = async (req, res) => {
  try {
    const poetryBooks = await pool.query(
      `SELECT * FROM Books WHERE 'Poetry' = ANY (genre);`
    );
    return res.status(200).json({ books: poetryBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Biography
exports.getBiographyBooks = async (req, res) => {
  try {
    const biographyBooks = await pool.query(
      `SELECT * FROM Books WHERE 'Biography' = ANY (genre);`
    );
    return res.status(200).json({ books: biographyBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Fantsay
exports.getFantasyBooks = async (req, res) => {
  try {
    const fantasyBooks = await pool.query(
      `SELECT * FROM Books WHERE 'Fantasy' = ANY (genre);`
    );
    return res.status(200).json({ books: fictionBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Mystery
exports.getMysteryBooks = async (req, res) => {
  try {
    const mysteryBooks = await pool.query(
      `SELECT * FROM Books WHERE 'Mystery' = ANY (genre);`
    );
    return res.status(200).json({ books: mysteryBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Science-Fiction
exports.getScienceFictionBooks = async (req, res) => {
  try {
    const scienceFictionBooks = await pool.query(
      `SELECT * FROM Books WHERE 'Science Fiction' = ANY (genre);`
    );
    return res
      .status(200)
      .json({ books: scienceFictionBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Philosophy
exports.getPhilosophyBooks = async (req, res) => {
  try {
    const philosophyBooks = await pool.query(
      `SELECT * FROM Books WHERE 'Philosophy' = ANY (genre);`
    );
    return res
      .status(200)
      .json({ books: philosophyBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Humor
exports.getHumorBooks = async (req, res) => {
  try {
    const humorBooks = await pool.query(
      `SELECT * FROM Books WHERE ' Humor' = ANY (genre);`
    );
    return res.status(200).json({ books: humorBooks, message: "SUCCESS!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Book-Details

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
    return res.status(200).json({ bookDetails, message: "Success, here is your book details!" });
  } catch (e) {
    return res.status(500).json({ message: "Server Error!" });
  }
};
