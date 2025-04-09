import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import Login from "@/app/components/login";
import type { Database } from "../../../../lib/database.types";

const LoginPage = async () => {
  const supabase = createServerComponentClient<Database>({ cookies });

  //セッション(ユーザ)の取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 認証している場合、リダイレクト

  if (user) {
    redirect("/");
  }

  return <Login />;
};

export default LoginPage;
