import {
    GraphQLID,
    GraphQLList,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLNonNull,
    GraphQLEnumType
} from "graphql";

// Mongoose models
import Client from "../models/Client.js";
import Project from "../models/Project.js";

// Client Type
const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        email: {type: GraphQLString},
        phone: {type: GraphQLString},
    })
});

// ProjectType
const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        description: {type: GraphQLString},
        status: {type: GraphQLString},
        client: {
            type: ClientType,
            async resolve(parent, args) {
                return await Client.findById(parent.clientId)
            }
        }
    })
})

const RootQuery = new GraphQLObjectType(({
    name: 'RootQuery',
    fields: {
        clients: {
            type: new GraphQLList(ClientType),
            async resolve(parent, args) {
                return await Client.find();
            }
        },
        client: {
            type: ClientType,
            args: {
                id: {type: GraphQLID}
            },
            async resolve(parent, args) {
                return await Client.findById(args.id);
            }
        },
        projects: {
            type: new GraphQLList(ProjectType),
            async resolve(parent, args) {
                return await Project.find();
            }
        },
        project: {
            type: ProjectType,
            args: {
                id: {type: GraphQLID},
            },
            async resolve(parent, args) {
                return await Project.findById(args.id);
            }
        }
    }
}));

// Mutations
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        // Add a client
        addClient: {
            type: ClientType,
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                email: {type: GraphQLNonNull(GraphQLString)},
                phone: {type: GraphQLNonNull(GraphQLString)},
            },
            async resolve(parent, args) {
                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                })
                return await client.save();
            }
        },
        // delete a client
        deleteClient: {
            type: ClientType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)}
            },
            async resolve(parent, args) {
                // Find and delete all projects associated with the client
                const projects = await Project.find({ clientId: args.id });
                await Promise.all(projects.map((project) => project.deleteOne()));

                // Delete the client
                return await Client.findByIdAndDelete(args.id);
            }
        },
        // add a project
        addProject: {
            type: ProjectType,
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                description: {type: GraphQLNonNull(GraphQLString)},
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatus',
                        values: {
                            new: {value: "Not Started"},
                            progress: {value: "In Progress"},
                            completed: {value: "Completed"},
                        },
                    }),
                    defaultValue: "Not Started",
                },
                clientId: {type: GraphQLNonNull(GraphQLID)}
            },
            async resolve(parent, args) {
                const project = new Project({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId
                })
                return await project.save();
            }
        },
        // delete a project
        deleteProject: {
            type: ProjectType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)}
            },
            async resolve(parent, args) {
                return await Project.findByIdAndDelete(args.id);
            }
        },
        // update a project
        updateProject: {
            type: ProjectType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)},
                name: {type: GraphQLString},
                description: {type: GraphQLString},
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatusUpdate',
                        values: {
                            new: {value: "Not Started"},
                            progress: {value: "In Progress"},
                            completed: {value: "Completed"},
                        },
                    })
                },
            },
            async resolve(parent, args) {
                return await Project.findByIdAndUpdate(args.id, {
                    $set: {
                        name: args.name,
                        description: args.description,
                        status: args.status,
                    }
                }, {new: true})
            }
        }
    }
})

export const schema = new GraphQLSchema({
    query: RootQuery,
    mutation
})