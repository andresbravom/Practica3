import  {GraphQLServer} from 'graphql-yoga'
import { MongoClient, ObjectID} from "mongodb";
import "babel-polyfill";
import { resolve } from 'dns';

const usr = "andresBM";
const pwd = "qwerty123";
const url = "cluster0-k7hro.gcp.mongodb.net/test?retryWrites=true&w=majority";

/**
 * Connects to MongoDB Server and returns connected client
 * @param {string} usr MongoDB Server user
 * @param {string} pwd MongoDB Server pwd
 * @param {string} url MongoDB Server url
 */

const connectToDb = async function(usr, pwd, url) {
    const uri = `mongodb+srv://${usr}:${pwd}@${url}`;
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  
    await client.connect();
    return client;
  };

/**
 * Starts GraphQL server, with MongoDB Client in context Object
 * @param {client: MongoClinet} context The context for GraphQL Server -> MongoDB Client
 */

const runGraphQLServer = function(context){
const typeDefs = `
  type Author{
    name: String!
    email: String!
    recipe: [Recipes]!
    id: ID!
  }

  type Recipes{
    title: String!
    description: String!
    date: Int!
    author: Author!
    ingredient: [Ingredients]!
    id: ID!
  }

  type Ingredients{
    name: String!
    recipe: [Recipes]!
    id: ID!
  }

  type Query{
    author(id: ID!): Author
    recipe(id: ID!): Recipes
    ingredient(id: ID!): Ingredients
    showRecipes: [Recipes]
    showAuthors: [Author]
    showIngredients: [Ingredients]
  }

  type Mutation{
    addAuthor(name: String!, email: String!): Author!
    addRecipes(title: String!, description: String!, author: ID!, ingredient: [ID]!) : Recipes!
    addIngredients(name: String!): Ingredients!
    removeRecipe(id: ID): String!
    removeAuthor(id: ID): String!
    removeIngredient(id: ID): String!
    updateAuthor(id: ID!, name: String, email: String): String!
    updateRecipe(id: ID!, title: String, description: String, ingredient: [ID]): String!
    updateIngredients(id: ID!, name: String!): String!
  }
`
const resolvers = {
  Author:{
    recipe: async (parent, args, ctx, info) => {
      const recipeID = ObjectID(parent._id);
      const { client } = ctx;
      const db = client.db("RecipesBook");
      const collection = db.collection("recipes");
      const result = await collection.find({author: recipeID}).toArray();
      return result;
    },
    id: (parent, args, ctx, info) => {
      const result = parent._id;
      return result;
    }
  },

  Recipes:{
    author: async (parent, args, ctx, info) => {
      const authorID = parent.author;
      const { client } = ctx;

      const db = client.db("RecipesBook");
      const collection = db.collection("authors");

      const result = await collection.findOne({ _id: ObjectID(authorID)});
      return result;
    },
    ingredient: async (parent, args, ctx, info) =>{
      const { client } = ctx;
      const db = client.db("RecipesBook");
      const collection = db.collection("ingredients");
      const ingredientArray = parent.ingredient.map(obj => ObjectID(obj));

      const result = await collection.find({_id:{$in: ingredientArray}}).toArray();
      return result;
    },
    id: (parent, args, ctx, info) => {
      const result = parent._id;
      return result;
    }
  },

  Ingredients:{
    recipe: async (parent, args, ctx, info) => {
      const ingredientID = parent._id;
     
      const { client } = ctx;
      const db = client.db ("RecipesBook");
      const collection = db.collection("recipes");
    
      const result = await collection.find({ingredient: ingredientID}).toArray();
      return result;
    },
    id: (parent, args, ctx, info) => {
      const result = parent._id;
      return result;
    }
  },

  Query: {
    showRecipes: async (parent, args, ctx, info) =>{
      const { client } = ctx;
      const db = client.db("RecipesBook");
      const collection = db.collection("recipes");
      const result = await collection.find({}).toArray();
      return result;
    },
    showAuthors: async (parent, args, ctx, info) =>{
      const { client } = ctx;
      const db = client.db("RecipesBook");
      const collection = db.collection("authors");
      const result = await collection.find({}).toArray();
      return result;
    },
    showIngredients: async (parent, arg, ctx, info) =>{
      const { client } = ctx;
      const db = client.db("RecipesBook");
      const collection = db.collection("ingredients");
      const result = await collection.find({}).toArray();
      return result;
    }
  },

  Mutation: {
    addAuthor: async (parent, args, ctx, info) => {
      const { name, email } = args;
      const { client } = ctx;

      const db = client.db("RecipesBook");
      const collection = db.collection("authors");

      const result = await collection.insertOne({ name, email });
      return {
          name,
          email,
          id: result.ops[0]._id,
      }
    },
    addIngredients: async (parent, args, ctx, info) =>{
      const { name } = args;
      const { client } = ctx;

      const db = client.db("RecipesBook");
      const collection = db.collection("ingredients");

      const result = await collection.insertOne({ name });
      return{
          name,
          id: result.ops[0]._id,
      }
    },   
    addRecipes: async (parent, args, ctx, info) =>{
      const { title, description, author, ingredient} = args;
      const date = new Date().getDate();
      const { client } = ctx;

      const db = client.db("RecipesBook");
      const collection = db.collection("recipes");

      const result = await collection.insertOne({title, description, author: ObjectID(author), ingredient: ingredient.map(obj => ObjectID(obj)), date});
      return{
        title,
        description, 
        author,
        ingredient,
        date,
        id: result.ops[0]._id
      }
    },
    removeAuthor: async (parent, args, ctx, info) => {
      const authorID = args.id;
      const { client } = ctx;

      const message = "Remove sucessfully";
      const db = client.db("RecipesBook");
      const collectionA = db.collection("authors");
      const collectionR = db.collection("recipes");

      const deleteRecipe = () =>{
        return new Promise((resolve, reject) =>{
          const result = collectionR.deleteMany({author: ObjectID(authorID)});
          resolve(result);
        }
      )};

      const deleteAuthor = () =>{
        return new Promise((resolve, reject) =>{
          const result = collectionA.deleteOne({_id: ObjectID(authorID)});
          resolve(result);
        }
      )};
      
      (async function(){
        const asyncFunctions = [
          deleteRecipe(),
          deleteAuthor()
        ];
        const result = await Promise.all(asyncFunctions);
      })();
      return message;
    },

    removeRecipe: async (parent, args, ctx, info) => {
      const recipeID = args.id;
      const { client } = ctx;

      const message = "Remove sucessfully";
      const db = client.db("RecipesBook");
      const collection = db.collection("recipes");
      
      await collection.deleteOne({_id: ObjectID(recipeID)}); 
      return message;
    },
    
    removeIngredient: async (parent, args, ctx, info) => {
      const ingredientID = args.id;
      const { client } = ctx;

      const message = "Remove sucessfully";
      const db = client.db("RecipesBook");
      const collectionR = db.collection("recipes");
      const collectionI = db.collection("ingredients");

      const deleteRecipe = () =>{
        return new Promise((resolve, reject) =>{
          const result = collectionR.deleteMany({ingredient: ObjectID(ingredientID)});
          resolve(result);
        }
      )};

      const deleteIngredient = () =>{
        return new Promise((resolve, reject) =>{
          const result = collectionI.deleteOne({_id: ObjectID(ingredientID)});
          resolve(result);
        }
      )};
      (async function(){
        const asyncFunctions = [
          deleteRecipe(),
          deleteIngredient()
        ];
        const result = await Promise.all(asyncFunctions);
      })();
      return message;
    },

    updateAuthor: async (parent, args, ctx, info) =>{
      const authorID = args.id;
      const { client } = ctx;

      const message = "Update sucessfuly";
      const db = client.db("RecipesBook");
      const collection = db.collection ("authors");

      const updateName = () =>{
        return new Promise((resolve, reject) => {
          const result = collection.updateOne({_id: ObjectID(authorID)}, {$set:{name:args.name}});
          resolve(result);
        }
      )};

      const updateEmail = () =>{
        return new Promise((resolve, reject) => {
          const result = collection.updateOne({_id: ObjectID(authorID)}, {$set:{email:args.email}});
          resolve(result);
        }
      )};
      
      (async function(){
        const asyncFunctions = [
          updateName(),
          updateEmail()
        ];
        const result = await Promise.all(asyncFunctions);
      })();
      return message;
    }

  },
}
const server = new GraphQLServer({typeDefs, resolvers, context});
server.start(() => console.log("Server started"));

};

const runApp = async function(){
    const client = await connectToDb(usr, pwd, url);
    console.log("Connect to Mongo DB");

    runGraphQLServer({client});
};

runApp();
