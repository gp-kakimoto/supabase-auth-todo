"use client";
//import { useRouter } from "next/navigation";
import { FormEventHandler, useState } from "react";
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
  //const router = useRouter();

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleIsSaveText = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setIsSaveText(e.target.value);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isSaveText === todo.task) {
        handleEdit();
        return;
      }
      const error = await editTodo(todo.id, todo.user_id, isSaveText);
      if (error) {
        console.log("エラーが発生しました。");
        handleEdit();
        return;
      }
    } catch (error) {
      return;
    }

    setTodos((oldTodos) =>
      oldTodos.map((oldTodo) =>
        oldTodo.id === todo.id
          ? { id: todo.id, user_id: todo.user_id, task: isSaveText }
          : oldTodo
      )
    );
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
        <form className="flex" onSubmit={(e) => handleSave(e)}>
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
