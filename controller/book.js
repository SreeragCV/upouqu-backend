exports.getAllBooks = async (req, res) => {
  try {
  } catch (e) {}
};

module.exports.contributeBook = async function (req, res) {
  try {
    const data = req.body;
    const file = req.files
    console.log(data);
    console.log(file);
    return res.json({ message: "SUCCESS" });
  } catch (e) {}
};
