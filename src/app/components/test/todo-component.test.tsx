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
  return <TodoComponent todos={todos} todo={todo} setTodos={handleSetTodos} />;
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
    /* await waitFor(() => {
      expect(screen.getByText("更新されたタスク")).toBeInTheDocument();
    });*/
  });

  it("タスクを削除できる", async () => {
    render(
      <TestWrapper
        initialTodos={[mockTodo]}
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
    /*await waitFor(() => {
      expect(screen.queryByText("テストタスク")).not.toBeInTheDocument();
    });*/
  });
});
