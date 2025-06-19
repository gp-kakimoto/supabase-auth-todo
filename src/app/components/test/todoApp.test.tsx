import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TodoApp from "../todoApp";
import userEvent from "@testing-library/user-event";
import * as supabaseFunctions from "../../utils/supabasefunctions";

// next/navigationのモック
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

// supabasefunctionsのモック
vi.mock("../../utils/supabasefunctions", () => ({
  getAllTodos: vi.fn(),
  addTodo: vi.fn(),
  deleteTodo: vi.fn(),
  editTodo: vi.fn(),
}));

describe("TodoApp", () => {
  const mockTodos = [
    { id: 1, user_id: "test", task: "タスク1" },
    { id: 2, user_id: "test", task: "タスク2" },
  ];
  const user = userEvent.setup();

  beforeEach(() => {
    (supabaseFunctions.getAllTodos as any).mockResolvedValue(mockTodos);
    (supabaseFunctions.addTodo as any).mockResolvedValue({
      id: 3,
      user_id: "test",
      task: "新規タスク",
    });
    (supabaseFunctions.deleteTodo as any).mockResolvedValue(true);
    (supabaseFunctions.editTodo as any).mockResolvedValue({
      id: 1,
      user_id: "test",
      task: "編集後タスク",
    });
  });

  it("初期表示でTodoリストが表示される", async () => {
    render(<TodoApp user_id="test" />);
    await waitFor(() => {
      expect(screen.getByText("タスク1")).toBeInTheDocument();
      expect(screen.getByText("タスク2")).toBeInTheDocument();
    });
  });

  // 追加テスト例
  it("新規タスクを追加できる", async () => {
    render(<TodoApp user_id="test" />);
    const input = screen.getByRole("textbox", { name: "ToDo" });
    //expect(input).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "ADD" });

    await userEvent.type(input, "新規タスク");
    await userEvent.click(button);

    //fireEvent.change(input, { target: { value: "新規タスク" } });
    //fireEvent.click(button);
    await waitFor(
      () => {
        expect(supabaseFunctions.addTodo).toHaveBeenCalledWith(
          "test",
          "新規タスク"
        );
        expect(screen.getByText("新規タスク")).toBeInTheDocument();
      } //,
      //{ timeout: 2000 }
    );
  });
  it("タスクを削除できる", async () => {
    render(<TodoApp user_id="test" />);
    //const deleteButton = screen.getAllByRole("button", { name: "DELETE" })[0];
    //await user.click(deleteButton);

    const deleteButtons = await screen.findAllByRole("button", {
      name: "DELETE",
    });
    await user.click(deleteButtons[0]);

    expect(supabaseFunctions.deleteTodo).toHaveBeenCalledWith(1);
    await waitFor(() => {
      expect(screen.queryByText("タスク1")).not.toBeInTheDocument();
    });
  });
  it("タスクを編集できる", async () => {
    render(<TodoApp user_id="test" />);
    const editButtons = await screen.findAllByRole("button", { name: "EDIT" });
    await user.click(editButtons[0]);

    const input = screen.getByDisplayValue("タスク1");
    await user.clear(input);
    await user.type(input, "編集後タスク");

    const saveButton = screen.getByRole("button", { name: "SAVE" });
    await user.click(saveButton);

    expect(supabaseFunctions.editTodo).toHaveBeenCalledWith(
      1,
      "test",
      "編集後タスク"
    );
    await waitFor(() => {
      expect(screen.getByText("編集後タスク")).toBeInTheDocument();
      expect(screen.queryByText("タスク1")).not.toBeInTheDocument();
    });
  });
});
