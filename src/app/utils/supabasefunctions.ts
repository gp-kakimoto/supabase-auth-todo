import  {supabase} from "./supabase"
import { Tables } from "../../../lib/database.types";
type Todo = Tables<'todos'>;

export const getAllTodos = async (user_id:string): Promise<Todo[] | null> => {
    const {data:allTodos,error} = await supabase
    .from('todos')
    .select("*")
    .eq('user_id',user_id)
    .order("id",{ascending:false});
    
    if(error){
        console.error(`Error fetching todos: ${error.message}`);
        return null;  
    }

    return allTodos;
  };

export const addTodo = async (user_id:string,text:string): Promise<Todo | null>  =>{
    const { data, error } = await supabase
  .from('todos')
  .insert([
    { 'user_id': user_id, 'task':text },
  ])
  .select()
  .single();

  if(error) {
    console.error(`Error adding todo: ${error.message}`);
    return null;
  }
  return data;

}

export const deleteTodo = async (id: number):Promise<boolean> => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) {
      console.error(`Error deleting todo: ${error.message}`);
      return false;
    }

    return true;
  }


  export const editTodo = async (
    id:number,
    user_id:string,
    task:string|null) :Promise <Todo|null> => {
      try{
    const { data,error } = await supabase
        .from('todos')
        .update({task:task })
        .eq("id", id)
        .select();
    
    if(error){
        console.error(`Error updating todo: ${error.message}`);
        return null;
    }
    return data ? data[0] : null; // Assuming you want to return the updated todo
  } catch (err) {
    console.error(`Error updating todo: ${err}`);
    return null;
  }
}


