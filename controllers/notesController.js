const supabase = require("../config/supabase");

// =============================
// ADD NOTE
// =============================
exports.addNote = async (req, res) => {
  try {
    const { heading, content } = req.body;

    if (!heading || !content) {
      return res.status(400).json({ error: "Heading and content are required" });
    }

    const { data, error } = await supabase
      .from("notes")
      .insert([{ user_id: req.user.id, heading, content }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Note added successfully", note: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// GET NOTES
// =============================
exports.getNotes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ notes: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// DELETE NOTE
// =============================
exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Note not found" });

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
