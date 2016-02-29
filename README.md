# Snack Overflow


### Description
Snack Overflow is a community of picky eaters.
Always wanted to have a BLT but you are vegan or keep kosher? Snack overflow is the place for you.

* Share recipes for people with specialized diets
* Search for recipes by category (kosher, vegan, vegetarian, non-dairy, allergies, etc) or by ingredient
* Join a community of people facing the same dietary restrictions

Live version: https://blooming-forest-16867.herokuapp.com/

### Wireframes

* [Guest Landing Page](planning/wireframes/landing_page.pdf)
* [Member Landing Page](planning/wireframes/landing_logged_in.pdf)
* [Recipe List View](planning/wireframes/list_page.pdf)
* [Show Recipe View](planning/wireframes/show_page.pdf)
* [Add/Edit Recipe View](planning/wireframes/add_edit.pdf)
* [Edit Profile View](planning/wireframes/edit_profile_page.pdf)

### Schema

![ERD](planning/erd/erd.png)

### User Stories

See the [user stories readme](planning/user_stories.md)


### Dependencies

External Dependencies:

* node ~ 5.4.1
* npm ~ 3.7.3
* Postgesql 9.5

### Installation

Clone the repository, navigate to the app folder in the terminal and run:
```bash
npm install
```
This will install all the npm modules needed to run the server

### Setting Up The Database

Export the link to your database as DATABASE_URL.
Run the following command in the terminal:
```
npm run resetdb
```
This will create a database called snackoverflow on your machine. This feature has only been tested on a Linux machine.

### Contributing

Fork this repository and hack away. Please look at the [contibuting readme](contributing.md) before making a pull request.

### News

The latest news can be found on the [news readme](news.md)
