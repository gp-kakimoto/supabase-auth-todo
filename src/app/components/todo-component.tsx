"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Todo } from "../utils/interfaces";
import { addTodo, deleteTodo, getAllTodos } from "../utils/supabasefunctions";
type Props = {
  todos: Todo[];
  todo: Todo;
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  key: number;
};
const TodoComponent = (props: Props) => {
  const { todos, setTodos, todo, key } = props;
  const [text, setText] = useState("");
  const [hasError, setHasError] = useState<boolean>(false);
  //const [todos, setTodos] = useState<Todo[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const router = useRouter();

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setIsEditing(!isEditing);
  };
  const handleDelete = async (number: number) => {
    try {
      const error = await deleteTodo(number);
      if (error) {
        console.log("エラーが発生しました。");
        return;
      }
      if (todos.length > number && number > 0) {
        setTodos((oldTodos) => [
          ...oldTodos,
          oldTodos[number + 1],
          oldTodos[number - 1],
          ...oldTodos,
        ]);
      } else {
        const tmp = await getAllTodos(todo.user_id);
        if (tmp) setTodos(tmp);
      }
    } catch (error) {
      return;
    }
    router.refresh();
  };

  return (
    <li
      key={todo.number}
      className="bg-green-400 mx-2 w-[410px] flex justify-between break-woards border-b 2px border-l 4px"
    >
      <span className="break-words w-[330px]">{todo.data}</span>
      {isEditing && (
        <button className="bg-red-300 rounded-2xl" onClick={() => handleSave()}>
          SAVE
        </button>
      )}
      {!isEditing && (
        <button className="bg-red-300 rounded-2xl" onClick={() => handleEdit()}>
          EDIT
        </button>
      )}
      <button
        className="bg-red-300 rounded-2xl"
        onClick={() => handleDelete(todo.number)}
      >
        DELETE
      </button>
    </li>
  );
};

export default TodoComponent;
