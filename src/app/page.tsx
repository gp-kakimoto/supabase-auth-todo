import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "../../lib/database.types";
import TodoApp from "@/app/components/todoApp";

const Home = async () => {
  const supabase = createServerComponentClient<Database>({
    cookies,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="text-center text-xl">
      {user ? <TodoApp user_id={user.id} /> : <div>未ログイン</div>}
    </div>
  );
};
export default Home;
