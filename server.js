import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";


let tweets = [
    {
        id:"1",
        text: "first",
        userId: "2",
    },
    {
        id:"2",
        text: "second",
        userId: "1",
    },
    {
        id:"3",
        text: "hello",
    },
]

let users=[
    {
        id:"1",
        firstName:"jeon",
        lastName:"woonki",
    },{
        id:"2",
        firstName:"elon",
        lastName:"mask",
    }
];

/**
 * schema definition language(SDL)
 * 꼭 gql의 타입을 정의할때 root는 Query 아래로 지정해야 한다.
 */
const typeDefs = gql`
    type User{
        id:ID!
        firstName: String!
        lastName: String!
        fullName: String!
    }
    """
    Tweet object represents a resource for a Tweet
    """
    type Tweet{
        id:ID!
        text:String!
        author:User
    }
    type Query {
        allUsers:[User!]!
        allTweets: [Tweet]
        tweet(id: ID): Tweet
        allMovies: [Movie]!
    }
    type Mutation{
        # data, cache, server, ... (post,put,delete)뮤테이션과 관련된 기능들은 type Mutation에 정의해야함
        postTweet(text:String, userId: ID): Tweet
        deleteTweet(id:ID): Boolean!
    }
    type Movie {
        id: Int!
        url: String!
        imdb_code: String!
        title: String!
        title_english: String!
        title_long: String!
        slug: String!
        year: Int!
        rating: Float!
        runtime: Float!
        genres: [String]!
        summary: String
        description_full: String!
        synopsis: String
        yt_trailer_code: String!
        language: String!
        background_image: String!
        background_image_original: String!
        small_cover_image: String!
        medium_cover_image: String!
        large_cover_image: String!
    }
`;

const resolvers = {
    Query: {
        /**
         * 리졸버에서 넘겨받는 매개변수는 항상 두번째다
         * 리졸버의 첫번째 매개변수는 root query를 찾을 수 있음
         * @param {*} root 
         * @param {*} args 
         * @returns 
         */
        tweet(root, {id}){
            return tweets.find(tweet => tweet.id === id);
        },
        /**
         * query에 있는 tweet이 호출될때 resolover에 있는 tweet 함수가 아폴로 서버가 실행되게끔 함
         * @returns 
         */
        allTweets(){
           return tweets
        },
        allUsers(){
            return users
        },        
        /**
         * Rest API -> GraphQL 변환
         * @returns 
         */
        allMovies(){
            return fetch("https://yts.mx/api/v2/list_movies.json")
            .then((response) => response.json())
            .then((json) => json.data.movies);
        }
    },
    Mutation:{
        postTweet(_, { text, userId}){
            const user = users.find(user => user.id === userId)
            if(!user) throw new Error('userId must be exist');

            const newTweet = {
                id: tweets.length+1,
                text,
                user
            };
            tweets.push(newTweet);
            return newTweet;
        },
        deleteTweet(_, {id}){
            // in-memory db에서 id와 같은 tweet을 검색
            const tweet = tweets.find(tweet => tweet.id === id);
            if(!tweet) return false;
            // 전체 트윗이 저장된 tweets를 변동될 수 있는 변수인 let으로 바꾸고, filter를 거쳐 삭제할 id를 제외한 모든 트윗을 새로 저장함
            tweets = tweets.filter(tweet => tweet.id !== id)
            return true;
        }
        
    },

    /**
     * 실제 데이터가 없어도 실행될 수 있게 하는 동적인 리졸버.
     * users 객체엔 fullName이 없는데, 같은 객체의 이름 아래 fullName을 지정하면 아래 함수가 실행되면서,
     * 첫 argument에는 User 객체의 정보가 저장되어 활용할 수 있다.
     */
    User: {
        fullName(root){            
            return `${root.firstName} ${root.lastName}`
        }
    },
    /**
     * Tweet 객체와 User 객체의 연관성을 위해 사용
     * Tweet의 author 타입은 User객체로 지정되어 있지만 users의 어떤 User가 Tweet과 연관 되어 있는지 확인할 수는 없다.
     * author({userId})처럼 리졸버를 사용해 userId를 받아서 users에서 같은 userid를 찾아 user를 반환하는 것으로
     * author의 정보를 연관시킬 수 있다.
     */
    Tweet:{
        author({userId}){
            return users.find(user => user.id === userId);
        }
    }
}

const server = new ApolloServer({typeDefs, resolvers})

server.listen().then(({url}) => {
    console.log(`running on ${url}`)
});