// {
//   content: "句子内容",
//   author: "作者",
//   source: "来源"
// }

let app = require('express')()
let request = require('superagent')
let cheerio = require('cheerio')
let fs = require('fs')

app.get('/', (req, res) => {
  res.send('请用"http://localhost:3000/search/关键字"的方式来访问')
})

app.get('/search/:keyword', async (req, res, next) => {
  let { keyword } = req.params
  console.log('keyword:' + keyword)
  let encodedKeyword = encodeURIComponent(keyword)
  let sentenceList = []
  let page = 0
  let goingOn = true
  while (goingOn) {
    console.log('page:' + page)
    let response = await request.get(`http://www.juzimi.com/search/node/${encodedKeyword}%20type%3Asentence?page=${page}`).catch((err) => {
      goingOn = false
      console.log('done')
    })
    if (goingOn) {
      let html = response.text
      let $ = cheerio.load(html)
      $('.views-field-phpcode').each(function (index, element) {
        let content = $(element).find('.views-field-phpcode-1').find('a').text()
        let temp = $(element).find('.xqjulistwafo').find('a')
        let author
        let source
        if (temp.length == 2) {
          author = temp.eq(0).text()
          source = temp.eq(1).text()
        } else {
          author = ''
          source = temp.eq(0).text()
        }
        sentenceList.push({
          content,
          author,
          source
        })
      })
      ++page
    }
  }
  fs.writeFileSync(`${keyword}.json`, JSON.stringify(sentenceList))
  res.json(sentenceList)
})

app.listen(3000, () => {
  console.log('Server is listening at http://localhost:3000')
})

