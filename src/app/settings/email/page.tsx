import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import Email from "@/app/components/email";
import type { Database } from "../../../../lib/database.types";

// メールアドレス変更ページ
const EmailPage = async () => {
  const supabase = createServerComponentClient<Database>({ cookies });

  //userの取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未認証の場合、リダイレクト ユーザが存在取得できない場合
  if (!user) {
    redirect("/auth/login");
  }

  return <Email email={user.email!} />;
};

export default EmailPage;
