'use strict'

const request = require('superagent')
const cheerio = require('cheerio')

const base_url = 'http://github.com/'

const data = []
request
  .get('https://github.com/rccoder/blog/issues')
  .end((err, res) => {
    if(err) {
      console.log(err)
    } else {
      let $ = cheerio.load(res.text)
      $('.Box-row-link').each((id, value) => {
        let url = `${base_url}${value.attribs.href}`
        let title = `${value.children[0].data.trim()}`
        let label = []
        label.push()
      })
    }
  })
