import { ApolloServer, gql } from "apollo-server";


const tweets = [
    {
        id:"1",
        text: "first",
    },
    {
        id:"2",
        text: "second",
    },
    {
        id:"3",
        text: "hello",
    },
]

/**
 * schema definition language(SDL)
 * 꼭 gql의 타입을 정의할때 root는 Query 아래로 지정해야 한다.
 */
const typeDefs = gql`
    type User{
        id:ID
        username: String        
    }
    type Tweet{
        id:ID!
        text:String!
        author:User
    }
    type Query {
        allTweets: [Tweet]
        tweet(id: ID): Tweet
    }
    type Mutation{
        # data, cache, server, ... (post,put,delete)뮤테이션과 관련된 기능들은 type Mutation에 정의해야함
        postTweet(text:String, userId: ID): Tweet
        deleteTweet(id:ID): Boolean!
    }
`;

const resolvers = {
    Query: {
        /**
         * query에 있는 tweet이 호출될때 resolover에 있는 tweet 함수가 아폴로 서버가 실행되게끔 함
         * @returns 
         */
        tweet(){
            console.log("called")
            return null;
        },
        allTweets(){
           return tweets
       }
    }
}

const server = new ApolloServer({typeDefs, resolvers})

server.listen().then(({url}) => {
    console.log(`running on ${url}`)
});