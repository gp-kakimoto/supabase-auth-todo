//import Image from "next/image";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "../../lib/database.types";

const Home = async () => {
  const supabase = createServerComponentClient<Database>({
    cookies,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="text-center text-xl">
      {user ? <div>ログイン済み</div> : <div>未ログイン</div>}
    </div>
  );
};
export default Home;
