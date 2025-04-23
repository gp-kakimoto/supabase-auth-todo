CREATE TABLE todos (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  task text,
  user_id uuid NOT NULL REFERENCES public.profiles (id)
);

-- RLSを有効にする (まだ有効になっていない場合)
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除する（もしあれば）
-- DROP POLICY IF EXISTS "your_policy_name" ON public.todos;

-- 新しいポリシーを作成する
-- 新しいポリシーを作成する (認証されたユーザーが自分のTodoのみを検索できるようにする)
CREATE POLICY "Allow authenticated users to select their own todos"
ON public.todos FOR SELECT
USING ( auth.uid() = user_id );

CREATE POLICY "Allow authenticated users to insert their own todos"
ON public.todos FOR INSERT
WITH CHECK ( auth.uid() = user_id );

-- 新しいポリシーを作成する (認証されたユーザーが自分のTodoのみを削除できるようにする)
CREATE POLICY "Allow authenticated users to delete their own todos"
ON public.todos FOR DELETE
USING ( auth.uid() = user_id );

-- 新しいポリシーを作成する (認証されたユーザーが自分のTodoのみを更新でき、user_idを変更できないようにする)
CREATE POLICY "Allow authenticated users to update their own todos"
ON public.todos FOR UPDATE
USING ( auth.uid() = user_id )       -- 更新対象の行が現在のユーザーのものであるかチェック
WITH CHECK ( auth.uid() = user_id ); -- 更新後の行も現在のユーザーのものであるかチェック (user_id 変更防止)