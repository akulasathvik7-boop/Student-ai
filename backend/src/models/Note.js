const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    semester: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        value: { type: Number, min: 1, max: 5 },
      },
    ],
    downloads: {
      type: Number,
      default: 0,
    },
    approved: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.virtual("averageRating").get(function averageRating() {
  if (!this.ratings || this.ratings.length === 0) {
    return 0;
  }
  const sum = this.ratings.reduce((acc, r) => acc + (r.value || 0), 0);
  return Math.round((sum / this.ratings.length) * 10) / 10;
});

noteSchema.virtual("ratingCount").get(function ratingCount() {
  return this.ratings ? this.ratings.length : 0;
});

noteSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    title: this.title,
    subject: this.subject,
    branch: this.branch,
    semester: this.semester,
    fileUrl: this.fileUrl,
    uploadedBy: this.uploadedBy,
    downloads: this.downloads,
    approved: this.approved,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    averageRating: this.averageRating,
    ratingCount: this.ratingCount,
  };
};

const Note = mongoose.model("Note", noteSchema);

module.exports = { Note };

