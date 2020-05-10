# Data Monitoring App for Rocket Hub / Turbo Hub
## A locally-hosted webapp for checking your data usage on the ZTE MFR275R / MFR275T

### Why
The ZTE MFR275R has an admin console accessible via web browser that is able to display some basic data usage statistics. Unfortunately it is very limited and doesn't contain historical usage data. It is also not coordinated in any way with billing dates/reset periods from your ISP which makes it very inconvenient to use and difficult to accurately interpret.

### How it works
This app/script is built to run on a computer that can access the MFR275 admin panel over LAN. In other words, you need to be able to access the admin panel from the web browser of the computer that you will be running this script on.

When you first run the script, you will need to also log in to your MFR275R using your web browser, so that you can authenticate.

The script will log data usage over time and allow you to view charts and information about your daily data usage and how much data you have remaining in your current billing period.

### Requirements/Dependancies
- A computer with LAN access to your MFR275x
- node.js

## Getting started
To use this app, you will need to clone this repo and install its dependancies.
`npm install`

Then run the app
`node app.js`

Note that you will need to authenticate into your MFR275r from your web browser in order for the script to access usage information. You can do this by opening a web browser and logging in at the IP of your router through its web interface. 

Before running the app, you will want to make adjustments to some variables.

Currently there is no config file, you will need to locate variables in the code in order to customize the setup for your needs:
-your destination router's IP
-your billing reset date
-your monthly data alottment

### To Do
 - Make a config file so that its easy to change things like the destination router's IP, billing reset date, monthly data alottment

