const puppeteer = require('puppeteer');
const express = require('express')
const moment = require('moment')
const app = express()
var cors = require('cors')
const port = 3901
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
    
    console.log('waiting for page');
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
        console.log('dashboard loaded');
        //console.log(bodyHTML)
        await page.waitForSelector("#tdCurrentFlux");
       // console.log('waiting for usage');
        await page.waitFor(1500);
       // console.log('finding usage');
        totalUsage = await page.evaluate(() => document.querySelector("#tdCurrentFlux").innerHTML);
        
        const lastEntryMoment = moment(db.get('entries').last().value().time);
        console.log('last entry was at '+lastEntryMoment.format("dddd, MMMM Do YYYY, h:mm:ss a"));
        if(moment().isAfter(lastEntryMoment.add(7,'minutes') )){
            db.get('entries')
            .push({ time: new Date().getTime(), usage: totalUsage })
            .write()
            console.log('logging usage: '+totalUsage);
        }else{
            console.log('too early to add another entry');
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
app.listen(port, () => console.log(`Example app listening on port ${port}!`))





