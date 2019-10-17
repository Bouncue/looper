const express = require('express');
const sender = require('./util/sender');
const shootRouter = require('./router/shoot');
const iam = require('./util/whoAmI');
const url = require('./util/url');

// things you should set before deploying this code
// that are 'iam' in whoAmI.js and 'counterpart' in here mainly app.js
// for b, commented out this line down below: // firstTime = false; // IMPORTANT THIS IS JUST FOR b
// fo c, set iamOn to false

const app = express();
const breakRouter = express.Router();
const awakeRouter = express.Router();

let startTime = 0, duration = 0, firstTime = true, durationTreshHold = 6;
let counterpart = ['b']; // set this before deploy
let iamOn = true;

const sleepHours = [22, 23, 0, 1, 2, 3, 4, 5];

setInterval(() => {
    if (iamOn) {
        const date = new Date();
        const hour = date.getHours();
        const minute = date.getMinutes();
        // console.log('WHAT TIME IS IT:', hour, minute);

        if (!(sleepHours.includes(hour))) {
            if ((iam === 'a' & counterpart[0] === 'b') || (iam === 'b' & counterpart[0] === 'c') || (iam === 'c' & counterpart[0] === 'a')) {
                sender(''); // insert target url here to schedule awake state
                sender(''); // insert target url here to schedule awake state
                // console.log('YOU TWO, WAKE UP!!!');
            }
        } else {
            // console.log('TIME FOR THEM TO SLEEP');
        }

        if (startTime === 0) {
            startTime = { hour: hour, minute: minute };
        } else {
            let theDuration;
            // calculate duration here
            let theHour = startTime.hour;
            // if looping started from between 17-xx and 23-xx oclock (evening)
            if (startTime.hour > 16) {
                // if current hour between 00-00 and 6 morning
                if (hour >= 0 && hour < 7) {
                    // it needs to be deducted by 10
                    theHour -= 10;
                    // so that when starting hour being deducted by current hour
                    // it will yield correct duration
                    theDuration = theHour - hour; // (23 (evening) - 10) = (13 - 6 (morning - current)) = been 7 hour of running
                } else {
                    theDuration = hour - theHour;
                }
            } else {
                theDuration = hour - theHour;
            }
            
            if (theDuration > durationTreshHold) { // 7 > 6
                if (minute < startTime.minute) { // current: 5 minutes <  start: 20 minutes
                    // enter here means there are still some minutes remaining before reached 7 hour
                    duration = (((theDuration * 60) - (startTime.minute - minute)) / 60);
                } else {
                    // enter here means it's has reached 7 hour
                    duration = (((theDuration * 60) + (minute - startTime.minute)) / 60);
                    durationTreshHold += theDuration;
                }
            } else {
                // enter here means current duration is under 7 hour
                if (minute < startTime.minute) {
                    duration = (((theDuration * 60) - (startTime.minute - minute)) / 60);
                } else {
                    duration = (((theDuration * 60) + (minute - startTime.minute)) / 60);
                }
            }
        }
        // console.log('duration: ', duration)
        // wake-keeper firing one another
        if (iam === 'b' && firstTime) {
            // the first time ever b just has to run 7 huors long
            // afterwards it has to run 14 hours long
            if (duration < 7) {
                console.log('CURRENT COUNTERPART: ', counterpart[0]);
                sender(url[counterpart[0]] + '/' + iam);
            } else {
                // console.log(`I, the ${iam}, want to take a break`);
                startTime = 0;
                duration = 0;
                iamOn = false;
                firstTime = false; // forever
                // tell the counterpart i am about to take a break
                sender((url[counterpart[0]] + '/break/' + iam));
            }
        } else {
            if (duration < 14) {
                console.log('CURRENT COUNTERPART: ', counterpart[0]);
                sender(url[counterpart[0]] + '/' + iam);
            } else {
                // console.log(`I, the ${iam}, want to take a break`);
                startTime = 0;
                duration = 0;
                iamOn = false;
                // tell the counterpart i am about to take a break
                sender((url[counterpart[0]] + '/break/' + iam));
            }
        }
    }
}, 1200000);

const idList = ['a', 'b', 'c'];
breakRouter.get('/:who', (req, res) => {
    const whois = req.params.who; // who's want to take a break?
    // console.log(`who's about to take a break: `, whois);
    const newCounterpart = idList.filter(id => (id !== iam && id !== whois));
    counterpart = newCounterpart;
    sender(url[counterpart[0]] + '/wake/' + iam); // waking up the new counterpart
    return res.send(''); // I just tell ' + iam + ' I want to take a break
});

app.use('/break', breakRouter);

awakeRouter.get('/:who', (req, res) => {
    const whois = req.params.who; // who's waking me up?
    counterpart = [whois];
    startTime = 0;
    duration = 0;
    durationTreshHold = 6;
    iamOn = true;
    // firstTime = false; // IMPORTANT THIS IS JUST FOR b
    return res.send(''); // iam + ' SAYS HE IS AWAKE AND READY'
});

app.use('/wake', awakeRouter);

app.use('/', shootRouter);

app.listen(process.env.PORT || 8080);