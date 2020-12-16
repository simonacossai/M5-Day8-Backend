const express = require("express");
const { check, validationResult } = require("express-validator");
const { readDB, writeDB } = require("../lib/utilities");
const { join } = require("path");
const uniqid = require("uniqid");
const sgMail = require("@sendgrid/mail")
const attendeesRouter = express.Router();
const participantPath = join(__dirname, "./attendees.json");

attendeesRouter.get("/", async (req, res, next) => {
  try {
    const attendees = await readDB(participantPath);
    res.send(attendees);
  } catch (error) {
    console.log(error);
    next(error);
  }
});


attendeesRouter.get("/:id", async(req, res, next) => {
    try {
        const attendees = await readDB(participantPath);
        const foundAttendees = attendees.filter(attendee => attendee._id === req.params.id)
      if (foundAttendees.length > 0) {
        res.send(foundAttendees)
      } else {
        const err = new Error()
        err.httpStatusCode = 404
        next(err)
      }
    } catch (error) {
      next(error)
    }
  })

attendeesRouter.post(
  "/",
  [
    check("email").exists().isEmail().withMessage("this email format is not valid"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err = new Error();
        err.message = errors;
        err.httpStatusCode = 400;
        next(err);
      } else {
        const attendeesArray = await readDB(participantPath);

        const newAttendee = {
          ...req.body,
          _id: uniqid(),
        };

        console.log(newAttendee);
        const email = newAttendee.email
        await sendEmail(email)
        attendeesArray.push(newAttendee);
        writeDB(participantPath, attendeesArray);
        res.status(201).send(newAttendee)
    }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

const sendEmail = async(email) => {
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
          to: `${email}`,
          from: "cossaisimona@gmail.com",
          subject: "Sending with Twilio SendGrid is Fun",
          text: `Hi, see you at diego's birthday then! :D`,
          html: "<strong>Hi, see you at diego's birthday then!</strong>",
        }
        await sgMail.send(msg)
      } catch (error) {
        next(error)
      }
}


module.exports = attendeesRouter;





