const app = require('express')(),
    graphql = require('graphql'),
    graphqlHTTP = require('express-graphql')

let PORT = 3000

let users = [1, 2, 3, 4, 5, 6, 7, 8]
let teams = [1, 2, 3, 4, 5, 6, 7, 8]

let getUserById = function (id) {
    return {
        name: `User ID ${id}`,
        id: id,
        teams: teams.filter((doc) => {
            return doc % 2 == 1
        })
    }
}

let getTeamById = function (id) {
    return {
        name: `Team ID ${id}`,
        owners: teams.filter((doc) => {
            return doc * id > 10 && doc / id < 4
        }),
        member: teams.filter((doc) => {
            return doc % 2 == 0
        })
    }
}

let UserType = new graphql.GraphQLObjectType({
    name: 'User',
    description: 'User Object',
    fields: () => {
        return {
            id: {
                type: graphql.GraphQLInt,
            },
            name: {
                type: graphql.GraphQLString,
            },
            teams: {
                type: new graphql.GraphQLList(TeamType),
                resolve: (parent, args, ctx) => {
                    return parent.teams.map((team) => {
                        return getTeamById(team)
                    })
                }
            }
        }
    }
})

let TeamType = new graphql.GraphQLObjectType({
    name: 'Team',
    description: 'Team Object',
    fields: {
        name: {
            type: graphql.GraphQLString,
        },
        owners: {
            type: new graphql.GraphQLList(UserType),
            resolve: (parent, args, ctx) => {
                return parent.owners.map((owner) => {
                    return getUserById(owner)
                })
            }
        },
        member: {
            type: new graphql.GraphQLList(UserType),
            resolve: (parent, args, ctx) => {
                return parent.member.map((member) => {
                    return getUserById(member)
                })
            }
        }
    }
})

app.use(graphqlHTTP({
    schema: new graphql.GraphQLSchema({
        query: new graphql.GraphQLObjectType({
            name: 'Query',
            description: 'Query Type',
            fields: {
                user: {
                    type: new graphql.GraphQLList(UserType),
                    args: {
                        id: {
                            type: graphql.GraphQLInt
                        }
                    },
                    resolve: (parent, args, ctx) => {
                        if (args.id) {
                            return [getUserById(args.id)]
                        } else {
                            return users.map((user) => {
                                return getUserById(user)
                            })
                        }

                    }
                },
                team: {
                    type: new graphql.GraphQLList(TeamType),
                    args: {
                        id: {
                            type: graphql.GraphQLInt
                        }
                    },
                    resolve: (parent, args, ctx) => {
                        if (args.id) {
                            return [getTeamById(args.id)]
                        } else {
                            return users.map((user) => {
                                return getTeamById(user)
                            })
                        }
                    }
                }
            }
        })
    }),
    graphiql: true
}))

app.listen(PORT, () => {
    console.log(`Server Running on ${PORT}`)
})
