"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Navigation from "./navigation";
import type { Database } from "../../../lib/database.types";

const SupabaseListener = async () => {
  const supabase = createServerComponentClient<Database>({ cookies });

  //セッションの取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // プロフィールの取得
  let profile = null;

  if (user) {
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    profile = currentProfile;

    //メールアドレスを変更した場合、プロフィールを更新
    if (currentProfile && currentProfile.email !== user.email) {
      //メールアドレスを更新
      const { data: updatedProfile } = await supabase
        .from("profiles")
        .update({ email: user.email })
        .match({ id: user.id })
        .select("*")
        .single();

      profile = updatedProfile;
    }
  }
  return <Navigation user={user} profile={profile} />;
};

export default SupabaseListener;
