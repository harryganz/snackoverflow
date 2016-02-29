BEGIN;
  INSERT INTO categories (category) VALUES
  ('Vegan'), ('Vegetarian'), ('Kosher'), ('Peanut Allergy');

  INSERT INTO users (username, email) VALUES
  ('seifdin', 'target@example.com'),
  ('user2', 'user2@example.com');

  INSERT INTO recipes (title, directions, user_id) VALUES
  ('Title 1', 'This is the first descriptions fjjfknlnsfknsdf,nsndf.jns.djfn.jn',
  1),
  ('Title 2', 'Another desciptions hrhjbrkhbfhbsljcbhsbchsbcljhbsch shc sjhc ,sh cs ',
  2);

  INSERT INTO ingredients (ingredient) VALUES
  ('Red Pepper'), ('Beef'), ('Green Pepper'), ('Sliced Onion'),
  ('Ketchup'), ('Salsa Verde');

  INSERT INTO categories_recipes_xref (recipe_id, category_id) VALUES
  (1,1), (1,2), (2,1), (2,2), (2,3), (2,4);

  INSERT INTO ingredients_recipes_xref (recipe_id, ingredient_id) VALUES
  (1,1), (1,3), (1,4),(2,2), (2,5), (2,6);

COMMIT;
