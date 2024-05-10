const robotsParser = require("robots-parser")

const Robots = function (url, text, productToken) {
  const robots = robotsParser(url, text)

  return {
    get sitemaps() {
      return robots.getSitemaps()
    },
    isAllowed: (url) => robots.isAllowed(url, productToken),
  }
}

module.exports = Robots
