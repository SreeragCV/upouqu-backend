const { isNotEmpty, isNumber } = require("../utils/validation");
const pool = require("../config/dbconfig");
const { s3UploadV3 } = require("../S3Bucket/s3Service");

exports.getAllBooks = async (req, res) => {
  try {
  } catch (e) {}
};

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


    // const newBook = await pool.query(
    //   `INSERT INTO Books (book_name, price, image_url, pdf_url, genre, user_id) VALUES('${book_name}', '${price}', '${image_url}', '${pdf_url}', '${genre}, '${req.user_id}') RETURNING *;`
    // );

    console.log(newBook);

    return res.json({ message: "SUCCESS" });
  } catch (e) {
    console.log(e);
  }
};
