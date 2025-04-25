//import { Todo } from "./interfaces";
import  {supabase} from "./supabase"
import { Tables } from "../../../lib/database.types";
type Todo = Tables<'todos'>;

export const getAllTodos = async (user_id:string): Promise<Todo[] | null> => {
    const {data:allTodos,error} = await supabase.from('todos').select("*").eq('user_id',user_id).order("id",{ascending:false});
    //console.log(`in getAllTodos user_id=${user_id}`);
    
    if(error){
        console.log(`error,${error}`);
    }
    return (error)?null:allTodos;
  };

export const addTodo = async (user_id:string,text:string)  =>{
    const { data, error } = await supabase
  .from('todos')
  .insert([
    { 'user_id': user_id, 'task':text },
  ])
  .select()
  .single();
  if(data) return data;
  else if(error) return null;

}

export const deleteTodo = async (id: number) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    return error;
  }


  export const editTodo = async (id:number,user_id:string,task:string|null) =>{
    const { data,error } = await supabase
        .from('todos')
        .update({task:task })
        .eq("id", id)
        .select();
    return (!!!error)? null : data;
}
