-- ▼ 特定ユーザーとしてログインしたていにする
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'yourid'; -- 実際にあるユーザーID

-- ▼ 1) 自分の行は更新できる
UPDATE public.todos
   SET task = '自分の todo を編集できる'
 WHERE id = 18;

-- ▼ 2) 他人の行は更新できない
UPDATE public.todos
   SET task = '他人の todo を編集できない'
 WHERE id = 28; -- 他人のtodoのid

 -- ▼ 3) user_idを書き換えようとするとエラーになるか確認(①②が通ったら試す)
UPDATE public.todos
    SET user_id = 'notyourid' -- 別のユーザーのID
 WHERE id = 18;