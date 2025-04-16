//import Image from "next/image";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "../../lib/database.types";
import { getAllTodos } from "@/app/utils/supabasefunctions";
import TodoApp from "@/app/components/todoApp";
import { Todo } from "@/app/utils/interfaces";

const Home = async () => {
  const supabase = createServerComponentClient<Database>({
    cookies,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*let todos = null;
  if (user) {
    console.log(`user.id=${user.id}`);
    todos = await getAllTodos(user.id);
    console.log(`getAllTodos+${todos?.length}`);
  }
*/
  return (
    <div className="text-center text-xl">
      {user ? <TodoApp user_id={user.id} /> : <div>未ログイン</div>}
    </div>
  );
};
export default Home;
