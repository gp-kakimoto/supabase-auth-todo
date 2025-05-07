"use client";

import {
  Dispatch,
  SetStateAction,
  ChangeEvent,
  FormEvent,
  useState,
} from "react";
import { deleteTodo, editTodo } from "../utils/supabasefunctions";
import { Tables } from "../../../lib/database.types";

type Todo = Tables<"todos">;
type Props = {
  todos: Todo[];
  todo: Todo;
  setTodos: Dispatch<SetStateAction<Todo[]>>;
};
const TodoComponent = (props: Props) => {
  const { todos, setTodos, todo } = props;
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaveText, setIsSaveText] = useState(todo.task);

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsSaveText(e.target.value);
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaveText === todo.task) {
      toggleEdit();
      return;
    }

    try {
      const error = await editTodo(todo.id, todo.user_id, isSaveText);

      if (!error) {
        console.error("エラーが発生しました。", error);

        return;
      }
      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t.id === todo.id ? { ...t, task: isSaveText } : t
        )
      );
      toggleEdit();
    } catch (err) {
      console.error("エラーが発生しました。", err);
      return;
    }
  };
  const handleDelete = async (number: number) => {
    try {
      const error = await deleteTodo(number);
      if (!error) {
        console.error("エラーが発生しました。", error);
        return;
      }

      setTodos((oldTodos) => {
        return oldTodos.filter((todo) => todo.id !== number);
      });
    } catch (err) {
      console.error("削除中にエラーが発生しました:", err);
    }
  };

  return (
    <li className="bg-green-400 mx-2 w-[410px] flex justify-between break-woards border-b 2px border-l 4px">
      {!isEditing ? (
        <>
          {" "}
          <span className="break-words w-[290px]">{todo.task}</span>
          <button
            className="bg-red-300 rounded-2xl"
            onClick={() => toggleEdit()}
          >
            EDIT
          </button>
        </>
      ) : (
        <form className="flex" onSubmit={(e) => handleSave(e)}>
          <input
            id={"save"}
            name={"save"}
            onChange={handleInputChange}
            value={isSaveText ? isSaveText : ""}
            className="bg-gray-300 w-[290px] mx-0 px-0"
          />
          <button className="bg-red-300 rounded-2xl">SAVE</button>
        </form>
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
