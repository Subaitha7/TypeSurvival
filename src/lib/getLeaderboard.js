import supabase from "./supabaseClient";

export async function getLeaderboard() {

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("survival_score", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Leaderboard error:", error.message);
    return [];
  }

  return data;
}