import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import Logout from "@/app/components/logout";
import type { Database } from "../../../../lib/database.types";

//ログアウトページ
const LogoutPage = async () => {
  const supabase = createServerComponentClient<Database>({ cookies });

  // userの取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  //userが未認証の場合、リダイレクト
  if (!user) {
    redirect("/auth/login");
  }

  return <Logout />;
};

export default LogoutPage;
