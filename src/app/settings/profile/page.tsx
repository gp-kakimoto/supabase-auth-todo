import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import Profile from "../../components/profile";

import type { Database } from "../../../../lib/database.types";

const ProfilePage = async () => {
  const supabase = createServerComponentClient<Database>({ cookies });
  // セッションの取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未承認の場合、リダイレクト
  if (!user) {
    redirect("/auth/login");
  }

  return <Profile />;
};

export default ProfilePage;
