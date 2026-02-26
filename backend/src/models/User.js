const mongoose = require("mongoose");

const ROLES = {
  STUDENT: "student",
  ADMIN: "admin",
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /.+\@.+\..+/,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },
    bookmarkedNotes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Note",
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

module.exports = { User, ROLES };

