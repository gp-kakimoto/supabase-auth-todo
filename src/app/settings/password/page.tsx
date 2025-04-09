import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import Password from "@/app/components/password";
import type { Database } from "../../../../lib/database.types";

const PasswordPage = async () => {
  const supabase = createServerComponentClient<Database>({
    cookies,
  });
  // ユーザの取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ユーザが取得できない場合、リダイレクト
  if (!user) {
    redirect("/auth/login");
  }

  return <Password />;
};

export default PasswordPage;
