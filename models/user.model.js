const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); 

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: { type: String, unique: true, sparse: true },
    mobile: { type: String, unique: true, sparse: true },

    password: {
      type: String,
      required: true,
      select: false, 
    },

    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model("User", userSchema);


/**
 *ADMIN
 
 EMAIL:khaledm@test.com
 PASSWORD: k123456

  email:mohamed@test.com
  pas:m123456

*/
/** USER

 EMAIL: user@test.com
  PASSWORD: u123456

  email:sameh@test.com
  pas:s123456
  */