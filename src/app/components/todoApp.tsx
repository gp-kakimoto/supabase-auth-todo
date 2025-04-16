"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Todo } from "../utils/interfaces";
import { addTodo, deleteTodo, getAllTodos } from "../utils/supabasefunctions";
import TodoComponent from "@/app/components/todo-component";
type Props = {
  //todos: Todo[] | null;
  user_id: string;
};
const TodoApp = (props: Props) => {
  const { user_id } = props;
  const [text, setText] = useState("");
  const [hasError, setHasError] = useState<boolean>(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const tmp = await getAllTodos(user_id);
      if (tmp) setTodos(tmp);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const isSucsess = await addTodo(user_id, text);
      console.log(`isSucsess=`, isSucsess);
      if (!isSucsess) {
        setHasError(true);
        console.log("is Not Sucsess");
        return;
      }
      setTodos((oldTodo) => [isSucsess, ...oldTodo]);
    } catch (error) {
      setHasError(true);
      console.log("error");
      return;
    }
    setHasError(false);
    setText("");
    // setTodos(oldTodo => [...oldTodo,isSucsess]);
    console.log("refresh");
    //router.refresh();
  };
  const handleText = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setText(e.target.value);
  };

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-[420px] bg-green-200 ml-auto mr-auto mb-2">
        <h1>ToDoList</h1>
        <form
          className="flex w-[410px]  mx-0  p-0 justify-end border-b 2px"
          onSubmit={(e) => handleSubmit(e)}
        >
          <input
            id={"ToDo"}
            name={"ToDo"}
            value={text ? text : ""}
            onChange={handleText}
            className="bg-gray-300 w-[340px] mx-0 px-0"
          />
          <button className="shadow-md border-2 px-1 py-1 rounded-lg bg-blue-200 max-w-[80px]">
            ADD
          </button>
        </form>
        {hasError && <h2>Todoの追加に失敗しました。</h2>}
        <ul className="w-[420px] px-0">
          {todos ? (
            todos.map((todo) => (
              <TodoComponent
                todos={todos}
                todo={todo}
                setTodos={setTodos}
                key={todo.number}
              />
            ))
          ) : (
            <h2>Todoがない、もしくはネットワークエラー</h2>
          )}
        </ul>
      </main>
    </div>
  );
};

export default TodoApp;
