const moment = require('moment')
const fs = require('fs')
// const low = require('lowdb')
// const FileSync = require('lowdb/adapters/FileSync')
// const adapter = new FileSync('db.json')
// const db = low(adapter)
// db.read();
let prevdb = 'db.'+moment().subtract(1, 'months').format('MMM')+'-'+moment().format('MMM')+'-'+moment().format('YYYY')+'.json';
console.log(prevdb)

fs.access(prevdb, fs.F_OK, (err) => {
  if (err) {
    console.error(err)
    return
  }
  console.error("file exists")
  //file exists
})