import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import ResetPassword from "@/app/components/reset-password";
import type { Database } from "../../../../lib/database.types";

const ResetPasswordPage = async () => {
  const supabase = createServerComponentClient<Database>({ cookies });
  //ユーザの取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // userが認証されている場合,グインページへリダイレクト
  if (user) {
    redirect("/");
  }

  return <ResetPassword />;
};

export default ResetPasswordPage;
