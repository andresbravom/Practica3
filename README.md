# Recipe book  👨🏽‍🍳
Recipe book is a Node.js app. The user can add, edit and remove (authors, recipes and ingredients), the query is through graphql.
## Install 🛠️
To use this app it is necessary to install:
* npm
```sh
npm install
```
* mongo DB
```sh
https://www.mongodb.com/download-center
```
## Dependencies ⚙️
* GraphQL server will listen on `127.0.0.1:4000`
* Install graphql
```sh
npm install graphql-yoga
```
* install mongo DB
```sh
npm install mongodb
```

## Clone respository 👇🏽
To clone or download this repository copy this link:
```sh
https://github.com/andresbravom/Practica3.git
```

## Run ▶️
Use this command to start the execution
```js
npm start
```
## Features 💻
### Mutations
```js
addAuthor
addRecipes
addIngredients
removeRecipe
removeAuthors
removeIngredients
updateAuthor
updateRecipe
updateIngredients
```
#### Add Author 👩🏽‍🍳
```js
    mutation{
        addAuthor(name: "Andrés", email: "andres@gmail.com")
}
```
#### Add Recipe 📜
To add recipes is it necesary put the id in the `author:` and `ingredient:` fields

```js
    mutation{
        addRecipes(name: "Pizza", description: "How to make a vegetable pizza", author: "0f995037-71ce-42f3-a9c6-8e03a07d9e76", ingredient:  ["2cf2c8e2-9c20-4d9e-88d3-0e3854362301", "9f28c050-0ca6-4ac3-9763-79b3a4a323f2","fb466cc5-973d-44dc-b838-ce2dae423f90"]), 
}
```
#### Add Ingredients 🍅🌽🥕
```js
mutation{
    addIngredients(name: "tomato"){
}
```

### Queries
```js
showRecipes
showAuthors
showIngredients
```
#### INPUT
```js
query{
  showAuthors{
    name
    email
    recipe{
      title
      ingredient{
        name
      }
    }
  }
}
```
#### OUTPUT
```js
"data": {
    "showAuthors": [
      {
        "name": "Andrés",
        "email": "andres@ilovejs.com",
        "recipe": [
          {
            "title": "Pizza",
            "ingredient": [
              {
                "name": "tomato"
              },
              {
                "name": "pepper"
              }
            ]
          },
          {
            "title": "Burguer",
            "ingredient": [
              {
                "name": "cheese"
              },
              {
                "name": "tomato"
              }
            ]
          }
        ]
      },
      {
        "name": "Laura",
        "email": "laura@ilovejs.com",
        "recipe": [
          {
            "title": "Hot dog",
            "ingredient": [
              {
                "name": "pepper"
              },
              {
                "name": "cheese"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## Mongo DB 📸
In the following images you can see the database of the application distributed in 3 collections

### Authors

![ImageTest1](https://github.com/andresbravom/Practica3/blob/master/Images/authors.png)

### Recipes

![ImageTest1](https://github.com/andresbravom/Practica3/blob/master/Images/recipes.png)

## Ingredients

![ImageTest1](https://github.com/andresbravom/Practica3/blob/master/Images/ingredients.png)










