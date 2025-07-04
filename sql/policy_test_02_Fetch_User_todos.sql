-- 認証済みのユーザー (例: 'some_auth_uid') として実行
-- 'some_auth_uid' はテスト対象のユーザーの実際のUIDに置き換えてください
set role postgres; -- 一時的に管理者権限に戻ります
SELECT *
FROM public.todos
WHERE user_id = '924de6d7-07b5-4852-af3b-c61cd07ce9c4';
reset role; -- ロールを元に戻します
