import { mergeResolvers } from "@graphql-tools/merge";
import { taskResolvers } from "./taskResolvers.js";
import { userResolvers } from "./userResolvers.js";
import  workspaceResolver  from "./workspaceResolver.js";

const resolversArray = [workspaceResolver, taskResolvers , userResolvers ];

export default mergeResolvers(resolversArray);
