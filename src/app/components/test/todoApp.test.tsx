import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
    vi.clearAllMocks(); // 追加

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

  it("入力が空の場合はタスクが追加されずエラーメッセージが表示される", async () => {
    render(<TodoApp user_id="test" />);
    const input = screen.getByRole("textbox", { name: "ToDo" });
    const button = screen.getByRole("button", { name: "ADD" });

    // 入力を空にして送信
    await userEvent.clear(input);
    await userEvent.click(button);

    // addTodoは呼ばれない
    expect(supabaseFunctions.addTodo).not.toHaveBeenCalled();

    // エラーメッセージが表示される
    await waitFor(() => {
      expect(
        screen.getByText("Todoの追加に失敗しました。")
      ).toBeInTheDocument();
    });
  });
  it('textが空白や空文字の場合にconsole.error("入力が空です。")が呼ばれる', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    render(<TodoApp user_id="test" />);
    const input = screen.getByRole("textbox", { name: "ToDo" });
    const button = screen.getByRole("button", { name: "ADD" });

    // 空文字の場合
    await userEvent.clear(input);
    await userEvent.click(button);

    expect(consoleErrorSpy).toHaveBeenCalledWith("入力が空です。");

    // 空白のみの場合
    await userEvent.type(input, "   ");
    await userEvent.click(button);

    expect(consoleErrorSpy).toHaveBeenCalledWith("入力が空です。");

    consoleErrorSpy.mockRestore();
  });
  it('addTodoがnullを返した場合にconsole.error("Todoの追加に失敗しました。")が呼ばれる', async () => {
    // addTodoがnullを返すようにモック
    (supabaseFunctions.addTodo as any).mockResolvedValueOnce(null);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<TodoApp user_id="test" />);
    const input = screen.getByRole("textbox", { name: "ToDo" });
    const button = screen.getByRole("button", { name: "ADD" });

    await userEvent.type(input, "テストタスク");
    await userEvent.click(button);

    expect(supabaseFunctions.addTodo).toHaveBeenCalledWith(
      "test",
      "テストタスク"
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith("Todoの追加に失敗しました。");

    // エラーメッセージが表示されることも確認
    await waitFor(() => {
      expect(
        screen.getByText("Todoの追加に失敗しました。")
      ).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('addTodoで例外が発生した場合にconsole.error("エラーが発生しました。", error)が呼ばれ、エラーメッセージが表示される', async () => {
    const error = new Error("サーバーエラー");
    (supabaseFunctions.addTodo as any).mockRejectedValueOnce(error);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<TodoApp user_id="test" />);
    const input = screen.getByRole("textbox", { name: "ToDo" });
    const button = screen.getByRole("button", { name: "ADD" });

    await userEvent.type(input, "例外テスト");
    await userEvent.click(button);

    expect(supabaseFunctions.addTodo).toHaveBeenCalledWith(
      "test",
      "例外テスト"
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "エラーが発生しました。",
      error
    );

    await waitFor(() => {
      expect(
        screen.getByText("Todoの追加に失敗しました。")
      ).toBeInTheDocument();
    });
    consoleErrorSpy.mockRestore();
  });
});
