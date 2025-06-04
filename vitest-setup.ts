/// <reference types="vitest/globals" />
import "@testing-library/jest-dom/vitest";
import { vi } from 'vitest';

vi.mock('@supabase/auth-helpers-nextjs', () => {
  let todos = [
    { id: 1, user_id: "test", task: "test task" }
  ];
 
const fakeClient = {
  from: () => ({
    select: () => ({
      eq: () => ({
        order: () => ({
          data: [...todos],
          error: null
        })
      })
    }),
    insert: (rows:{user_id: string, task:string}[]) => ({
      select: () => ({    
          single: () => ({
            data: (() => {
              const { user_id, task } = rows[0];
              const newTodo = { id: todos.length +1, user_id, task };
              todos.unshift(newTodo);
              return newTodo;
            })(),
            error: null
          })
        
      })
    }),
    update: ({task}:{task:string}) => ({
        eq: (user_id:string,id:number) => ({
            select: () => ({
                data: (() => {
            const idx = todos.findIndex(todo => todo.id === id);
            if (idx !== -1 && task !== undefined) todos[idx].task =task;
            return [todos[idx]];
          })(),
          error: null
        })
      })
    }),
    delete: () => ({
      eq: ({ id }: { id: number }) => {
        todos = todos.filter(todo => todo.id !== id);
        return { error: null };
      }
    }),
    eq: function () { return this; },
    order: function () { return this; },
    single: function () { return this; },
  }),
  auth: {
    getSession: async () => ({
      data: { session: { user: { id: 'test-user' } } },
      error: null,
    }),
  }
};

  return { createClientComponentClient: () => fakeClient };
});
