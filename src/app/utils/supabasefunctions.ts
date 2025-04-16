import { Todo } from "./interfaces";
import  {supabase} from "./supabase"


export const getAllTodos = async (user_id:string|null): Promise<Todo[] | null> => {
    const {data:todo,error} = await supabase.from('todo').select("*").eq('user_id',user_id?user_id:"").order("number",{ascending:false});
    //console.log(`in getAllTodos user_id=${user_id}`);
    
    if(error){
        console.log(`error,${error}`);
    }
    return (error)?null:todo;
  };

export const addTodo = async (user_id:string,text:string)  =>{
    const { data, error } = await supabase
  .from('todo')
  .insert([
    { 'user_id': user_id, 'data':text },
  ])
  .select()
  .single();
  if(data) return data;
  else if(error) return null;

}

export const deleteTodo = async (number: number) => {
    const { error } = await supabase.from("todo").delete().eq("number", number);
    return error;
  }
