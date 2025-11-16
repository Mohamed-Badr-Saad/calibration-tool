import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    jobTitle: {
      type: String,
      enum: ["technician", "engineer"],
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

 const User = mongoose.model("User", userSchema);

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URI);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  await dbConnect();

  const { email, name, password, jobTitle } = req.body;
  if (!email || !name || !password || !jobTitle)
    return res.status(400).json({ message: "Email, name, password and jobTitle required" });

  if (
    email.toLowerCase() === (process.env.SUPER_ADMIN_EMAIL || "").toLowerCase()
  ) {
    return res.status(400).json({ message: "This email is reserved" });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(400).json({ message: "User already exists with this email" });

    const user = new User({
      email: email.toLowerCase(),
      name: name.trim(),
      password,
      role: "user",
      jobTitle,
    });
    const savedUser = await user.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
        jobTitle: savedUser.jobTitle,
        isActive: savedUser.isActive,
        createdAt: savedUser.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
