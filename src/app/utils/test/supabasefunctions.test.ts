import { describe, it, expect, vi } from 'vitest';
import  {supabase } from '../../utils/supabase';
import { addTodo, getAllTodos, deleteTodo, editTodo } from '../supabasefunctions';

describe('supabasefunctions', () => {
    beforeEach( () => {
      vi.clearAllMocks(); 

    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

  it('addTodo: 正常にTodoを追加できる', async () => {
    const todo = await addTodo('test','test add task');
    expect(todo).toBeDefined();
    expect(todo?.task).toBe('test add task');
  });

  it('getAllTodos: Todoリストを取得できる', async () => {
    const todos = await getAllTodos('test');
    expect(Array.isArray(todos)).toBe(true);
  });
  
  
    it('editTodo: Todoを編集できる', async () => {
      const todo = await editTodo(1, 'updated task');
      expect(todo).toBeDefined();
      expect(todo?.task).toBe('updated task');
    });

  it('deleteTodo: Todoを削除できる', async () => {
    const result = await deleteTodo(1);
    expect(result).toBe(true);
  });
  
  it('getAllTodos: エラー時はnullを返す', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: () => ({
        eq: () => ({
          order: () => ({
            data: null, error: { message: 'fetch error' } })
          })
        })
      } as any);

    const todos = await getAllTodos('test');
    expect(todos).toBeNull();
  });

  it('addTodo: エラー時はnullを返す', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      insert: () => ({
        select: () => ({
          single: () => ({ data: null, error: { message: 'insert error' } })
        })
      })
    } as any);

    const todo = await addTodo('test', 'test add task');
    expect(todo).toBeNull();
  });

  it('deleteTodo: エラー時はfalseを返す', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      delete: () => ({
        eq: () => ({ error: { message: 'delete error' } })
      })
    } as any);

    const result = await deleteTodo(1);
    expect(result).toBe(false);
  });

  it('editTodo: エラー時はnullを返す', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({ data: null, error: { message: 'update error' } })
          })
        })
      })
    } as any);

    const todo = await editTodo(1, 'updated task');
    expect(todo).toBeNull();
  });

  //以下例外発生時のテスト
  it('getAllTodos: 例外発生時はnullを返す', async () => {
    vi.spyOn(supabase, 'from').mockImplementation(() => {
      throw new Error('unexpected error');
    });
    const todos = await getAllTodos('test');
    expect(todos).toBeNull();
  });

  it('addTodo: 例外発生時はnullを返す', async () => {
    vi.spyOn(supabase, 'from').mockImplementation(() => {
      throw new Error('unexpected error');
    });
    const todo = await addTodo('test', 'test add task');
    expect(todo).toBeNull();
  });

  it('deleteTodo: 例外発生時はfalseを返す', async () => {
    vi.spyOn(supabase, 'from').mockImplementation(() => {
      throw new Error('unexpected error');
    });
    const result = await deleteTodo(1);
    expect(result).toBe(false);
  });

  it('editTodo: 例外発生時はnullを返す', async () => {
    vi.spyOn(supabase, 'from').mockImplementation(() => {
      throw new Error('unexpected error');
    });
    const todo = await editTodo(1, 'updated task');
    expect(todo).toBeNull();
  });


  //　例外発生時のエラーハンドリング関数のテスト 文字列がnullだった場合のテスト
  it('handleError: エラーメッセージがnullだった場合、"Error"と表示される', async() => {
    // addTodoのエラーハンドリングを用いてテスト
     vi.spyOn(supabase, 'from').mockImplementation(() => {
      throw new Error();
    });
    const todo = await addTodo('test', 'test add task');
    expect(todo).toBeNull();    
  });
});