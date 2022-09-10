const bot = async (req, res) => {
  res.json({
    message: "bot called",
  });
});

module.exports = bot;