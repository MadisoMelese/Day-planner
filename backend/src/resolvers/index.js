import { mergeResolvers } from "@graphql-tools/merge";
import { taskResolvers } from "./taskResolvers.js";
import { userResolvers } from "./userResolvers.js";

const resolversArray = [taskResolvers , userResolvers ];

export default mergeResolvers(resolversArray);
