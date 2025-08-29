const supabase = require("../config/supabase");
const sendOTP = require("../utils/mailer");
const jwt = require("jsonwebtoken");

// Helper function: Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper function: Cleanup expired OTPs automatically
const cleanupExpiredOTPs = async () => {
  await supabase
    .from("otps")
    .delete()
    .lt("expires_at", new Date().toISOString());
};

// =============================
// SIGNUP CONTROLLER
// =============================
exports.signup = async (req, res) => {
  try {
    let { name, dob, email } = req.body;

    if (!name || !dob || !email) {
      return res.status(400).json({ error: "Name, DOB and Email are required" });
    }

    // Convert DOB into YYYY-MM-DD format
    const formattedDOB = new Date(dob);
    if (isNaN(formattedDOB)) {
      return res.status(400).json({ error: "Invalid DOB format" });
    }

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (checkError) throw checkError;

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: "User already exists. Please sign in." });
    }

    // Insert new user into database
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([{ name, dob: formattedDOB, email }])
      .select()
      .single();

    if (insertError) throw insertError;

    // Clean up old OTPs
    await cleanupExpiredOTPs();

    // Generate OTP & expiry in UTC
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60000).toISOString();

    // Save OTP to DB
    const { error: otpError } = await supabase.from("otps").insert([
      {
        user_id: newUser.id,
        otp,
        expires_at: expiresAt
      }
    ]);
    if (otpError) throw otpError;

    // Send OTP via email
    await sendOTP(email, otp);

    res.status(201).json({
      message: "Signup successful. OTP sent to email for verification.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        dob: newUser.dob
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// SIGN-IN CONTROLLER
// =============================
exports.signin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    const { data: existingUsers, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (checkError) throw checkError;

    if (!existingUsers || existingUsers.length === 0) {
      return res.status(404).json({ error: "User not found. Please sign up first." });
    }

    const user = existingUsers[0];

    // Clean up old OTPs
    await cleanupExpiredOTPs();

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60000).toISOString();

    // Store OTP
    const { error: otpError } = await supabase.from("otps").insert([
      {
        user_id: user.id,
        otp,
        expires_at: expiresAt
      }
    ]);
    if (otpError) throw otpError;

    // Send OTP via email
    await sendOTP(email, otp);

    res.json({ message: "OTP sent successfully. Please verify to login." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// VERIFY SIGN-IN CONTROLLER
// =============================
exports.verifySignin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Fetch user
    const { data: existingUsers, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (userError) throw userError;
    if (!existingUsers || existingUsers.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = existingUsers[0];

    // Always fetch latest OTP
    const { data: otps, error: otpError } = await supabase
      .from("otps")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false })
      .limit(1);

    if (otpError) throw otpError;
    if (!otps || otps.length === 0) {
      return res.status(400).json({ error: "No OTP found. Please request a new one." });
    }

    const storedOtp = otps[0];

    // Debugging logs
    console.log("Stored Expiry (UTC):", storedOtp.expires_at);
    console.log("Current Time (UTC):", new Date().toISOString());

    // Check expiration
    if (new Date(storedOtp.expires_at).getTime() <= new Date().getTime()) {
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }

    // Check OTP match
    if (storedOtp.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Delete OTP after success ✅
    await supabase.from("otps").delete().eq("id", storedOtp.id);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Sign-in successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dob: user.dob
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// REQUEST OTP CONTROLLER
// =============================
exports.requestOTP = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if user exists, else create
    let { data: users } = await supabase.from("users").select("*").eq("email", email);
    let user = users && users[0];
    if (!user) {
      let { data, error } = await supabase.from("users").insert([{ email }]).select().single();
      if (error) throw error;
      user = data;
    }

    // Clean up old OTPs
    await cleanupExpiredOTPs();

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60000).toISOString();

    // Save OTP
    await supabase.from("otps").insert([
      { user_id: user.id, otp, expires_at: expiresAt }
    ]);

    // Send OTP via email
    await sendOTP(email, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// =============================
// RESEND OTP CONTROLLER
// =============================
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if the user exists
    const { data: existingUsers, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (userError) throw userError;

    if (!existingUsers || existingUsers.length === 0) {
      return res.status(404).json({ error: "User not found. Please sign up first." });
    }

    const user = existingUsers[0];

    // Delete all old OTPs for this user 🔄
    const { error: deleteError } = await supabase
      .from("otps")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) throw deleteError;

    // Clean up any expired OTPs for everyone
    await cleanupExpiredOTPs();

    // Generate a new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60000).toISOString();

    // Save new OTP
    const { error: otpError } = await supabase.from("otps").insert([
      {
        user_id: user.id,
        otp,
        expires_at: expiresAt,
      },
    ]);
    if (otpError) throw otpError;

    // Send new OTP via email
    await sendOTP(email, otp);

    res.json({
      message: "A new OTP has been sent successfully.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
