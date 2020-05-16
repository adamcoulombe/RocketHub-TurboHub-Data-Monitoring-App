const process = require('process');
const puppeteer = require('puppeteer');
const express = require('express')
const moment = require('moment')
const app = express()
var cors = require('cors')
const port = 3901;
let lastChecked;
let totalUsage = '';
let bodyHTML = 'no dashboard was available'
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)
db.read();
app.use(express.static('build'))
app.use(cors())
// app.get('/', (req, res) => {


//     (async () => {
//         const browser = await puppeteer.launch();
//         const context = await browser.createIncognitoBrowserContext();
//         const page = await context.newPage();
//         const client = await page.target().createCDPSession();

//         await page.goto("http://192.168.12.1/index.html#home", {
//             waitUntil: 'networkidle2'
//         });
        
//         console.log('waiting for page');
//         await page.waitForSelector("#langLogoBar")
        
//         //if ((await page.$("[name='txtPwd']")) !== null) {
//             // await page.waitForSelector("[name='txtPwd']");
//             // console.log('typing pass');
//             // await page.type("[name='txtPwd']", "admin");
//             // console.log('clicking login button');
//             // await page.evaluate(() => {
//             //         document.querySelector("#btnLogin").click();
//             // });
//             // console.log('waiting for a second');
//             // await page.waitFor(1500);
//             // console.log('loading dashboard');
//             // await page.goto("http://192.168.12.1/index.html#home", {
//             //     waitUntil: 'networkidle2'
//             // });
//             // bodyHTML = await page.evaluate(() => document.body.innerHTML);
//             // console.log('dashboard loaded');
//             // await page.waitForSelector("#tdCurrentFlux");
//             // console.log('waiting for usage');
//             // await page.waitFor(1500);
//             // console.log('finding usage');
//             // totalUsage = await page.evaluate(() => document.querySelector("#tdCurrentFlux").innerHTML);
//         //}else
        
//         if ((await page.$("[name='txtPwd']")) === null) {
//             bodyHTML = await page.evaluate(() => document.body.innerHTML);
//             console.log('dashboard loaded');
//             //console.log(bodyHTML)
//             await page.waitForSelector("#tdCurrentFlux");
//             console.log('waiting for usage');
//             await page.waitFor(1500);
//             console.log('finding usage');
//             totalUsage = await page.evaluate(() => document.querySelector("#tdCurrentFlux").innerHTML);
//         } else {

//         }


//         browser.close();
//     })()
//     .then(()=>{
//         res.send(totalUsage + bodyHTML);
//     });

// })

async function getUsage() {
    const browser = await puppeteer.launch();
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    const client = await page.target().createCDPSession();

    await page.goto("http://192.168.12.1/index.html#home", {
        waitUntil: 'networkidle2'
    });
    
    //console.log('waiting for page');
    await page.waitForSelector("#langLogoBar")
    
    //if ((await page.$("[name='txtPwd']")) !== null) {
        // await page.waitForSelector("[name='txtPwd']");
        // console.log('typing pass');
        // await page.type("[name='txtPwd']", "admin");
        // console.log('clicking login button');
        // await page.evaluate(() => {
        //         document.querySelector("#btnLogin").click();
        // });
        // console.log('waiting for a second');
        // await page.waitFor(1500);
        // console.log('loading dashboard');
        // await page.goto("http://192.168.12.1/index.html#home", {
        //     waitUntil: 'networkidle2'
        // });
        // bodyHTML = await page.evaluate(() => document.body.innerHTML);
        // console.log('dashboard loaded');
        // await page.waitForSelector("#tdCurrentFlux");
        // console.log('waiting for usage');
        // await page.waitFor(1500);
        // console.log('finding usage');
        // totalUsage = await page.evaluate(() => document.querySelector("#tdCurrentFlux").innerHTML);
    //}else
    
    if ((await page.$("[name='txtPwd']")) === null) {
        bodyHTML = await page.evaluate(() => document.body.innerHTML);
        //console.log('dashboard loaded');
        //console.log(bodyHTML)
        await page.waitForSelector("#tdCurrentFlux");
       // console.log('waiting for usage');
        await page.waitFor(1500);
       // console.log('finding usage');
        totalUsage = await page.evaluate(() => document.querySelector("#tdCurrentFlux").innerHTML);
        if(!!totalUsage.match(/MB/g)){
          let totalUsageMB = parseFloat(totalUsage);
          totalUsage = (totalUsageMB * 0.001).toFixed(2);
          totalUsage += 'GB';
        }
        const beginData = moment(db.get('dataOffset').value());
        const lastEntryMoment = moment(db.get('entries').last().value().time);
        console.log('last entry was at '+lastEntryMoment.format("dddd, MMMM Do YYYY, h:mm:ss a"));
        if(moment().isAfter(lastEntryMoment.add(7,'minutes') )){
            let totalUsageFloat = parseFloat(totalUsage);
            if(totalUsageFloat>0){
              let prevEntry = db.get('entries').last().value();
              let prevUsageFloat = parseFloat(prevEntry.usage);
              db.get('entries')
              .push({ time: new Date().getTime(), usage: totalUsage })
              .write()
              if(totalUsageFloat<prevUsageFloat){
                db.get('resets')
                .push(prevEntry)
                .write()            
              }
            }
           // console.log('logging usage: '+totalUsage);
        }else{
           // console.log('too early to add another entry');
        }

    } else {
        console.log('login is required');
    }
    browser.close();
}
getUsage();
setInterval(getUsage,60000)

app.get('/api/all', (req, res) => {
    res.json(db.get('entries'));
})
app.get('/api/current', (req, res) => {
    let periodStartTime;
    let periodEndTime;
    if(moment().date(9).endOf('day').isBefore(moment())){
      periodStartTime=moment().date(10).startOf('day')
      periodEndTime=moment().date(9).add(1,'months').endOf('day')
    }else{
      periodStartTime=moment().date(10).subtract(1,'months').startOf('day')
      periodEndTime=moment().date(9).endOf('day')
    }

    const periodData = db.get('entries').filter(function(o) { 
      return !moment(o.time).isBefore(periodStartTime);
    });

    res.json(periodData);
})
app.get('/api/previous', (req, res) => {
    let periodStartTime;
    let periodEndTime;
    if(moment().date(9).endOf('day').isBefore(moment())){
      periodStartTime=moment().date(10).subtract(1,'months').startOf('day')
      periodEndTime=moment().date(9).endOf('day')
      //console.log('its past the 10th')
    }else{
      //console.log('its before the 10th')
      periodStartTime=moment().date(10).subtract(2,'months').startOf('day')
      periodEndTime=moment().date(9).subtract(1,'months').endOf('day')
    }

    const periodData = db.get('entries').filter(function(o) { 
      return moment(o.time).isAfter(periodStartTime) && moment(o.time).isBefore(periodEndTime);
    });

    res.json(periodData);
})
app.get('/api/resets', (req, res) => {
  const periodData = db.get('resets')
  res.json(periodData);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

process.on('SIGINT', function() {
  process.exit(0);
});

process.on('SIGTERM', function() {
  process.exit(0);
});

process.on('exit', function() {
  process.stdout.write("Bye");
});



