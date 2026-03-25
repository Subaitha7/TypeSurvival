import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sxsuzuiajmsrqzbddrry.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c3V6dWlham1zcnF6YmRkcnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTQzMjgsImV4cCI6MjA4OTEzMDMyOH0.Hxh3EFuwqACL9hhupBB0r6WDh39HpBwYGwXv3bCCta8";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;