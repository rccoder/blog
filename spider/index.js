'use strict'

const request = require('superagent')
const cheerio = require('cheerio')

const data = []
request
  .get('https://github.com/rccoder/blog/issues')
  .end((err, res) => {
    if(err) {
      console.log(err)
    } else {
      let $ = cheerio.load(res.text)
      $('.Box-row-link').each((id, value) => {
          console.log(id)
          console.log(value)
      })

    }
  })
