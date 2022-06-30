const Notes = require("../model/Notes");
const express = require("express");
const { body, validationResult } = require("express-validator");
const fetchUser = require("../controllers/fetchUser");
const router = express.Router();

//@e All Routes need Login


//# ROUTE 1
//@i  for getting all notes of a current user
router.get("/", fetchUser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.status(200).json({
      status: 200,
      message: "Notes fetched successfully",
      error: [],
      length: notes.length,
      notes,
    });
  } catch (e) {
    //@e incase of Internal error i.e, server errors
    return res.status(500).json({
      status: 500,
      error: e,
      message: "Internal Server Error Occured please try again after some time",
    });
  }
});

//# ROUTE 2
//@i  for creating a new note of a current user
router.post(
  "/",
  fetchUser,
  body("title", "Notes Should Have Title").exists(),
  body("description", "Description should of min 10 characters").isLength({
    min: 10,
  }),
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({
        status: 400,
        error: error.array(),
        message: "Invalid Notes",
        notes: [],
      });
    }
    try {
      const { title, description, tag } = req.body;
      const notes = await Notes.create({
        title,
        description,
        tag,
        user: req.user.id,
      });
      return res.status(200).json({
        status: 200,
        message: "Notes created successfully",
        error: [],
        saving: notes,
      });
    } catch (e) {
      //@e incase of Internal error i.e, server errors
      return res.status(500).json({
        status: 500,
        error: e,
        message:
          "Internal Server Error Occured please try again after some time",
      });
    }
  }
);

//# ROUTE 3
//@i  for updating existing note of a current user
router.put("/:id", fetchUser, async (req, res) => {
  const noteId = req.params.id;
  const { title, description, tag } = req.body;
  //@i  if user does not provide any of the fields then there is nothig to update
  if (!title && !description && !tag)
    return res.status(400).json({
      status: 400,
      error: [
        {
          msg: "Please provide atleast one field to update",
        },
      ],
      message: "Invalid Update",
      notes: [],
    });
  const note = {};
  //@i  checking which fields are provided and updating them
  if (title) note.title = title;
  if (description) note.description = description;
  if (tag) note.tag = tag;
  try {
    //@i check if given id note exist or not and give responce accordingly
    const notes = await Notes.findById(noteId);
    if (!notes) {
      return res.status(404).json({
        status: 404,
        error: [{ msg: "Note not found" }],
        message: "Invalid Notes",
        notes: [],
      });
    }
    //@i check if user own this note or not and give responce accordingly
    if (notes.user.toString() != req.user.id) {
      return res.status(401).json({
        status: 401,
        error: [{ msg: "You are not authorized to update this note" }],
        message: "Unautorized",
        notes: [],
      });
    }
    //@i updating the note
    const updatedNote = await Notes.findByIdAndUpdate(noteId, note, {
      new: true,
    });
    return res.status(200).json({
      status: 200,
      message: "Notes updated successfully",
      error: [],
      notes: updatedNote,
    });
  } catch (e) {
    //@e incase of Internal error i.e, server errors
    return res.status(500).json({
      status: 500,
      error: e,
      message: "Internal Server Error Occured please try again after some time",
    });
  }
});

//# ROUTE 4
//@i  for deleting existing note of a current user

router.delete('/:id',fetchUser,async(req,res)=>{
  const noteId=req.params.id;
  try {
    //@i check if given id note exist or not and give responce accordingly
    const notes = await Notes.findById(noteId);
    if (!notes) {
      return res.status(404).json({
        status: 404,
        error: [{ msg: "Note not found" }],
        message: "Invalid Notes",
        notes: [],
      });
    }
    //@i check if user own this note or not and give responce accordingly
    if (notes.user.toString() != req.user.id) {
      return res.status(401).json({
        status: 401,
        error: [{ msg: "You are not authorized to delete this note" }],
        message: "Unauthorized",
        notes: [],
      });
    }
    //@i deleting the note
    const deletedNote = await Notes.findByIdAndDelete(noteId);

    return res.status(200).json({
      status: 200,
      message: "Notes deleted successfully",
      error: [],
      notes: deletedNote,
    });
  } catch (e) {
    //@e incase of Internal error i.e, server errors
    return res.status(500).json({
      status: 500,
      error: e,
      message: "Internal Server Error Occured please try again after some time",
    });
  }
})


module.exports = router;
