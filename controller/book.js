const { isNotEmpty, isNumber } = require("../utils/validation");

exports.getAllBooks = async (req, res) => {
  try {
  } catch (e) {}
};

module.exports.contributeBook = async function (req, res) {
  try {
    const { book_name, genre, price, description } = req.body;

    const file = req.files
    console.log(file.image[0].mimetype );

    let errors = { message: "Validation Errors!" };

    if (!isNotEmpty(book_name)) {
      errors.book_name = "Invalid Details, must give a book name";
    }

    if (!isNotEmpty(genre)) {
      errors.genre = "Invalid Details, must give a genre";
    }

    if(!isNumber(price)){
      errors.price = "Invalid Details, price must be a number"
    }

    if(!isNotEmpty(description) ){
      errors.description = 'Invalid Details, must give a description'
    }

    if (Object.keys(errors).length > 1) {
      return res.status(422).json(errors);
    }



    return res.json({ message: "SUCCESS" });
  } catch (e) {}
};
