
# Prompts

## Create a React/TypeScript app

> Create a vite starter app with react and typescript

## Implement the domain

> My domain has submissions. A submission has components. At the root level there are stations. A station can have fields. A field can have switches. They all have names. Other details are not important at this time. A submission and its components are retrieved from a backend api. These are two different endpoints because components can be filtered. A filter work on component name. Components are delivered from the backend as a flat list. The frontend must reorganize these as a tree with stations at the top. The tree can be expanded or collapsed. Each node can also be expanded or collapsed. Expand all and collapse all are features, so are expand and collapse individual nodes. A special feature is when all is collapsed and a text filter is applied, then all matching nodes should be visible including their parents. Use TypeScript. Design all types. Use type aliases only. Design dtos. Simulate the backend with fixed data for one submission and enough components to fill the tree completely. Design a function to retrieve a submission. Design a function to retrieve components for a submission, this function must also support filter. Design a function to build the component tree. Design functions to expand all, collapse all, expand one, collapse one, filter tree.

## Fix issues

> If I refresh and filter by "1", the switch 1 is visible as expected. If I collapse all, expand station a, and filter by "1", then all nodes disappear except for the parents of switch 1, but the switch itself is not visible

> The filter does not work on parent nodes

## Extend the domain

> Extend the domain: Station should have name and build year. Field should have name, station it belongs to (the parent), operating voltage. Switch should have name and rated voltage.

## Fix mixed concepts

> Separate domain code from the treeview code

> Treeview concepts are still present in the domain, like: TreeNodeType, ComponentTreeNode, TreeState. If these are domain concepts, give them better names. If treeview concepts are still mixed with domain concepts, then separate them

