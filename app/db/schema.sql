BEGIN;

  CREATE TABLE  IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY UNIQUE,
    title VARCHAR(255) NOT NULL,
    directions TEXT NOT NULL,
    user_id INT,
    is_shown BOOLEAN DEFAULT TRUE
  );

  CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY UNIQUE,
    ingredient VARCHAR(255)
  );

  CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY UNIQUE,
    category VARCHAR(255)
  );

  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY UNIQUE,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE
  );

  CREATE TABLE IF NOT EXISTS categories_recipes_xref (
    category_id INT,
    recipe_id INT
  );

  CREATE TABLE IF NOT EXISTS ingredients_recipes_xref (
    ingredient_id INT,
    recipe_id INT
  );

COMMIT;
