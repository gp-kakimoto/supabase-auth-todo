import { describe, it, expect, vi } from 'vitest';
import  {supabase } from '../../utils/test/mocks/supabase';
vi.mock('../utils/supabase', () => ({
  supabase:supabase,
}));
import { addTodo, getAllTodos, deleteTodo, editTodo } from '../supabasefunctions';

describe('supabasefunctions', () => {
    beforeEach(() => {
    vi.clearAllMocks(); // 追加
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
      const todo = await editTodo(1, 'test', 'updated task');
      expect(todo).toBeDefined();
      expect(todo?.task).toBe('updated task');
    });

  it('deleteTodo: Todoを削除できる', async () => {
    const result = await deleteTodo(1);
    expect(result).toBe(true);
  });
  

  it('addTodo: エラー時はnullを返す', async () => {
    vi.spyOn(supabase.from('todos'), 'insert').mockReturnValueOnce({
      select: () => ({
        single: () => ({ data: null, error: { message: 'insert error' } })
      })
    } as any);

    const todo = await addTodo('test', 'test add task');
    expect(todo).toBeNull();
  });

});