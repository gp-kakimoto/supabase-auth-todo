"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteTodo, editTodo, getAllTodos } from "../utils/supabasefunctions";
import { Tables } from "../../../lib/database.types";
type Todo = Tables<"todos">;
type Props = {
  todos: Todo[];
  todo: Todo;
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
};
const TodoComponent = (props: Props) => {
  const { todos, setTodos, todo } = props;
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaveText, setIsSaveText] = useState(todo.task);
  const router = useRouter();

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleIsSaveText = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setIsSaveText(e.target.value);
  };

  const handleSave = async () => {
    try {
      const error = await editTodo(todo.id, todo.user_id, isSaveText);
      if (error) {
        console.log("エラーが発生しました。");

        return;
      }
    } catch (error) {
      return;
    }

    setTodos((oldTodos) => [
      ...oldTodos,
      { id: todo.id, user_id: todo.user_id, task: isSaveText },
      ...oldTodos,
    ]);
    handleEdit();
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
  };

  return (
    <li className="bg-green-400 mx-2 w-[410px] flex justify-between break-woards border-b 2px border-l 4px">
      {!isEditing && <span className="break-words w-[330px]">{todo.task}</span>}
      {isEditing && (
        <form className="flex" onSubmit={(e) => handleSave()}>
          <input
            id={"save"}
            name={"save"}
            onChange={handleIsSaveText}
            value={isSaveText ? isSaveText : ""}
            className="bg-gray-300 w-[330px] mx-0 px-0"
          />
          <button className="bg-red-300 rounded-2xl">SAVE</button>
        </form>
      )}
      {!isEditing && (
        <button className="bg-red-300 rounded-2xl" onClick={() => handleEdit()}>
          EDIT
        </button>
      )}
      <button
        className="bg-red-300 rounded-2xl"
        onClick={() => handleDelete(todo.id)}
      >
        DELETE
      </button>
    </li>
  );
};

export default TodoComponent;
