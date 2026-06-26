ALTER ROLE authenticator SET pgrst.db_schemas = 'public, videoplanner';
NOTIFY pgrst, 'reload config';
