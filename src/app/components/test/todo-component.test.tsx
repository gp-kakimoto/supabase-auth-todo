import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TodoComponent from "../todo-component";
import userEvent from "@testing-library/user-event";
import { deleteTodo, editTodo } from "../../utils/supabasefunctions";
import { useState } from "react";

// supabasefunctionsのモック
vi.mock("../../utils/supabasefunctions", () => ({
  deleteTodo: vi.fn(),
  editTodo: vi.fn(),
}));

// テスト用ラッパー
const TestWrapper = ({
  //initialTodos,
  initialTodos,
  todo,
  setTodos,
}: {
  initialTodos: any[];
  todo: any;
  setTodos: any;
}) => {
  const [todos, updateTodos] = useState(initialTodos);
  // setTodosが呼ばれたらupdateTodosも呼ぶ
  const handleSetTodos = (updater: any) => {
    updateTodos(updater);
    setTodos(updater);
  };
  todo = todos.find((t) => t.id === todo.id) || null; // 更新されたtodoを再設定
  return todo === null ? (
    []
  ) : (
    <TodoComponent todos={todos} todo={todo} setTodos={handleSetTodos} />
  );
};

describe("TodoComponent", () => {
  const mockTodo = { id: 1, user_id: "test", task: "テストタスク" };
  let mockSetTodos: any;
  const user = userEvent.setup();

  beforeEach(() => {
    mockSetTodos = vi.fn();
    (deleteTodo as Mock).mockClear();
    (editTodo as Mock).mockClear();
    (deleteTodo as Mock).mockResolvedValue(true);
    (editTodo as Mock).mockResolvedValue({
      ...mockTodo,
      task: "更新されたタスク",
    });
  });

  it("タスク内容が表示される", () => {
    render(
      <TestWrapper
        initialTodos={[mockTodo]}
        todo={mockTodo}
        setTodos={mockSetTodos}
      />
    );
    expect(screen.getByText("テストタスク")).toBeInTheDocument();
  });

  it("編集モードに切り替えられる", () => {
    render(
      <TestWrapper
        initialTodos={[mockTodo]}
        todo={mockTodo}
        setTodos={mockSetTodos}
      />
    );
    const editButton = screen.getByText("EDIT");
    fireEvent.click(editButton);
    expect(screen.getByDisplayValue("テストタスク")).toBeInTheDocument();
  });

  it("タスクを保存できる", async () => {
    render(
      <TestWrapper
        initialTodos={[mockTodo]}
        todo={mockTodo}
        setTodos={mockSetTodos}
      />
    );
    const editButton = screen.getByText("EDIT");
    fireEvent.click(editButton);
    const input = screen.getByDisplayValue("テストタスク");
    fireEvent.change(input, { target: { value: "更新されたタスク" } });
    const saveButton = screen.getByText("SAVE");
    await user.click(saveButton);

    expect(editTodo).toHaveBeenCalledWith(
      mockTodo.id,
      mockTodo.user_id,
      "更新されたタスク"
    );
    expect(mockSetTodos).toHaveBeenCalled();
    // setTodosに渡されたアップデータ関数を検証
    const updater = mockSetTodos.mock.calls[0][0];
    const result = updater([mockTodo]);
    expect(result).toEqual([{ ...mockTodo, task: "更新されたタスク" }]);

    // 状態更新後の画面反映も確認 --> 更新後の画面の反映はtodoApp側で行うため、ここではコメントアウト
    await waitFor(() => {
      expect(screen.getByText("更新されたタスク")).toBeInTheDocument();
    });
  });

  it("編集内容が変更されていない場合、editTodoやsetTodosが呼ばれず編集モードが解除される", async () => {
    render(
      <TestWrapper
        initialTodos={[mockTodo]}
        todo={mockTodo}
        setTodos={mockSetTodos}
      />
    );
    const editButton = screen.getByText("EDIT");
    fireEvent.click(editButton);

    // 入力値を変更せずにそのままSAVE
    const input = screen.getByDisplayValue("テストタスク");
    // 入力値を変更しない
    const saveButton = screen.getByText("SAVE");
    await user.click(saveButton);

    // editTodoもsetTodosも呼ばれない
    expect(editTodo).not.toHaveBeenCalled();
    expect(mockSetTodos).not.toHaveBeenCalled();

    // 編集モードが解除され、spanでテキストが表示されている
    expect(screen.getByText("テストタスク")).toBeInTheDocument();
  });

  it("タスクを削除できる", async () => {
    render(
      <TestWrapper
        initialTodos={[mockTodo]}
        //initialTodos={initialTodos}
        todo={mockTodo}
        setTodos={mockSetTodos}
      />
    );
    const deleteButton = screen.getByText("DELETE");
    await user.click(deleteButton);
    expect(deleteTodo).toHaveBeenCalledWith(mockTodo.id);
    expect(mockSetTodos).toHaveBeenCalled();
    // setTodosに渡されたアップデータ関数を検証
    const updater = mockSetTodos.mock.calls[0][0];
    const result = updater([mockTodo]);
    expect(result).toEqual([]);
    // 状態更新後の画面反映も確認 --> 更新後の画面の反映はtodoApp側で行うため、ここではコメントアウト
    await waitFor(() => {
      expect(screen.queryByText("テストタスク")).not.toBeInTheDocument();
    });
  });

  it("editTodoでエラーが発生した場合、setTodosが呼ばれない", async () => {
    // editTodoがエラー（nullやfalseなど）を返すように設定
    (editTodo as Mock).mockResolvedValue(null);

    render(
      <TestWrapper
        initialTodos={[mockTodo]}
        todo={mockTodo}
        setTodos={mockSetTodos}
      />
    );
    const editButton = screen.getByText("EDIT");
    fireEvent.click(editButton);
    const input = screen.getByDisplayValue("テストタスク");
    fireEvent.change(input, { target: { value: "エラー発生タスク" } });
    const saveButton = screen.getByText("SAVE");
    await user.click(saveButton);

    // setTodosが呼ばれていないことを確認
    expect(mockSetTodos).not.toHaveBeenCalled();
    // 画面上のタスク内容が変わっていないことを確認
    //expect(screen.getByText("テストタスク")).toBeInTheDocument();
    const errorMessage = screen.getByDisplayValue("エラー発生タスク");
    expect(errorMessage).toBeInTheDocument();
  });

  it("editTodoでエラーが発生した場合、console.errorが呼ばれる", async () => {
    (editTodo as Mock).mockResolvedValue(null);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <TestWrapper
        initialTodos={[mockTodo]}
        todo={mockTodo}
        setTodos={mockSetTodos}
      />
    );
    const editButton = screen.getByText("EDIT");
    fireEvent.click(editButton);
    const input = screen.getByDisplayValue("テストタスク");
    fireEvent.change(input, { target: { value: "エラー発生タスク" } });
    const saveButton = screen.getByText("SAVE");
    await user.click(saveButton);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("editTodoで例外が発生した場合、console.errorが呼ばれる", async () => {
    // editTodoが例外を投げるように設定
    (editTodo as Mock).mockImplementation(() => {
      throw new Error("API Error");
    });
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <TestWrapper
        initialTodos={[mockTodo]}
        todo={mockTodo}
        setTodos={mockSetTodos}
      />
    );
    const editButton = screen.getByText("EDIT");
    fireEvent.click(editButton);
    const input = screen.getByDisplayValue("テストタスク");
    fireEvent.change(input, { target: { value: "例外発生タスク" } });
    const saveButton = screen.getByText("SAVE");
    await user.click(saveButton);

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(mockSetTodos).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("deleteTodoでエラーが発生した場合、setTodosが呼ばれない", async () => {
    // deleteTodoがエラー（nullやfalseなど）を返すように設定
    (deleteTodo as Mock).mockResolvedValue(false);

    render(
      <TestWrapper
        initialTodos={[mockTodo]}
        todo={mockTodo}
        setTodos={mockSetTodos}
      />
    );
    const deleteButton = screen.getByText("DELETE");
    await user.click(deleteButton);

    // setTodosが呼ばれていないことを確認
    expect(mockSetTodos).not.toHaveBeenCalled();
    // 画面上のタスク内容が変わっていないことを確認
    expect(screen.getByText("テストタスク")).toBeInTheDocument();
  });
  it("deleteTodoでエラーが発生した場合、console.errorが呼ばれる", async () => {
    (deleteTodo as Mock).mockResolvedValue(false);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <TestWrapper
        initialTodos={[mockTodo]}
        todo={mockTodo}
        setTodos={mockSetTodos}
      />
    );
    const deleteButton = screen.getByText("DELETE");
    await user.click(deleteButton);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("deleteTodoで例外が発生した場合、console.errorが呼ばれる", async () => {
    // deleteTodoが例外を投げるように設定
    (deleteTodo as Mock).mockImplementation(() => {
      throw new Error("削除APIエラー");
    });
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <TestWrapper
        initialTodos={[mockTodo]}
        todo={mockTodo}
        setTodos={mockSetTodos}
      />
    );
    const deleteButton = screen.getByText("DELETE");
    await user.click(deleteButton);

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(mockSetTodos).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
