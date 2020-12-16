const express = require("express");
const { check, validationResult } = require("express-validator");
const { readDB, writeDB } = require("../lib/utilities");
const { join } = require("path");
const uniqid = require("uniqid");

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

module.exports = attendeesRouter;