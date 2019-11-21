import  {GraphQLServer} from 'graphql-yoga'
import { MongoClient, ObjectID} from "mongodb";
import "babel-polyfill";

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
    removeAuthors(id: ID): String!
    removeIngredients(id: ID): String!
    updateAuthor(id: ID!, name: String, email: String): String!
    updateRecipe(id: ID!, title: String, description: String, ingredient: [ID]): String!
    updateIngredients(id: ID!, name: String!): String!
  
  }
`
const resolvers = {
  Author:{
    recipe: async (parent, args, ctx, info) =>{
      const recipeID = ObjectID(parent.id);
      const { client } = ctx;
      const db = client.db("RecipesBook");
      const collection = db.collection("recipes");
      const result = await collection.find({_id: recipeID}).toArray();
      return result;
    },
  },

  Recipes:{
    author: async (parent, args, ctx, info) => {
      const authorID = ObjectID(parent.author);
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
    }
  },
  // Ingredient:{
  //   recipe: async (parent, args, ctx, info) =>{
  //     const ingredientID = ObjectID(parent.id);
  //     const { client } = ctx;
  //     const db = client.db("RecipesBook");
  //     const collection = db.collection()
  //   }
  // },
Query: {},

  
  // recipe: (parent, args, ctx, info) => {
  //   if(!recipesData.some(obj => obj.id === args.id)){
  //     throw new Error(`Unknow recipe with id ${args.id}`);
  //   }
  //   const result = recipesData.find(obj => obj.id === args.id);
  //   return result;
  // },

//     ingredient: (parent, args, ctx, info) =>{
//       if(!ingredientsData.some(obj => obj.id === args.id)){
//         throw new Error(`Unknow ingredient with id ${args.id} `);
//       }
//       const result = ingredientsData.find(obj => obj.id === args.id);
//       return result;
//     },

//     showRecipes: (parent, args, ctx, info) =>{
//       return recipesData;
//     },

    // showAuthors: (parent, args, ctx, info) =>{
    //   const result = authorData.map(element =>{
    //     return element;
    //   });
    //   return result;
    // },


//     showIngredients: (parent, arg, ctx, info) =>{
//       const result = ingredientsData.map(element =>{
//         return element;
//       });
//       return result;
//     }
  

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
    
        const result = await collection.insertOne({title, description, author, ingredient, date});
        return{
            title,
            description, 
            author, 
            ingredient,
            date,
            id: result.ops[0]._id
        }
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
