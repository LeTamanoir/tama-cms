BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "user" (
	"username"	TEXT NOT NULL UNIQUE,
	"password_hash"	TEXT NOT NULL,
	"id"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT)
);
COMMIT;
