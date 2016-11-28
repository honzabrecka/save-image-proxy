const fileType = require('file-type')
const fs = require('fs')
const crypto = require('crypto')
const http = require('http')
const https = require('https')
const Transform = require('stream').Transform

const url = 'https://honzabrecka.com/css/honza.jpg'
const url2 = 'http://assets-cdn.github.com/images/spinners/octocat-spinner-32.gif'
const url3 = 'https://github.com/sindresorhus/file-type'
const url4 = 'http://weknowyourdreams.com/images/dog/dog-07.jpg'

const fileTypeChecker = new Transform({

  transform(chunk, encoding, done) {
    if (!this.mime) {
      const {mime} = fileType(chunk) || {mime: 'unrecognized'}
      this.mime = mime
    }

    done(this.mime !== 'image/jpeg' ? 'Nein!' : null, chunk)
  }
})

const hash = crypto.createHash('md5')

http.get(url2, res => {
  // res.once('data', chunk => {
  //   res.destroy();
  //   console.log(fileType(chunk))
  // })
  fileTypeChecker.on('error', (e) => {
    console.log('err', e)
  })
  hash.on('finish', () => {
    console.log('hash', hash.read().toString('hex'))

    const opts = {
      host: 'content.dropboxapi.com',
      path: '/2/files/upload',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.TOKEN_DROPBOX}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': '{\"path\": \"/test/dog.jpg\",\"mode\": \"add\",\"autorename\": false,\"mute\": false}'
      }
    }
    const r = https.request(opts, res => {
      console.log(res.statusCode)
      fs.unlink('dog.jpg', () => console.log('done'))
    })

    fs.createReadStream('dog.jpg').pipe(r)
  })
  const s = res.pipe(fileTypeChecker)

  s.pipe(hash)
  s.pipe(fs.createWriteStream('dog.jpg'))
})
