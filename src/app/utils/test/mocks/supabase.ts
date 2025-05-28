
/*export const supabase = {
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: { id: 1, user_id: "test", task: "test task" }, error: null }),
    delete: () => ({ error: null }),
    update: () => ({ data: [{ id: 1, user_id: "test", task: "updated task" }], error: null }),
    eq: function () { return this; },
    order: function () { return this; },
    single: function () { return this; },
  }),
};*/

import { Database } from "../../../../../lib/database.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
export const supabase = createClientComponentClient();


/*
let todos = [
  { id: 1, user_id: "test", task: "updated task" }
];

export const supabase = {
  from: () => ({
    select: () => Promise.resolve({ data: [...todos], error: null }),
    insert: ({ user_id, task }: { user_id: string, task: string }) => {
      const newTodo = { id: todos.length + 1, user_id, task };
      todos.unshift(newTodo);
      return Promise.resolve({ data: newTodo, error: null });
    },
    delete: () => {
      todos = [];
      return Promise.resolve({ error: null });
    },
    update: ({ task }: { task: string }) => {
      if (todos.length > 0) todos[0].task = task;
      return Promise.resolve({ data: [todos[0]], error: null });
    },
    eq: function () { return this; },
    order: function () { return this; },
    single: function () { return this; },
  }),
};*/