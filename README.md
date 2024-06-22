<p align="center">
  <a href="http://bettermode.com/" target="blank">
    <img src="https://cdn.prod.website-files.com/632a253b6e9c1587d2b8853d/65b1c2aa9d5db8a934a345a9_bettermode-logo-toggle-light.png" width="200" alt="Nest Logo" />
  </a>
</p>

# Bettermode

## Senior Back-End Engineer Project Assignment

This project impliments a permission and group system for X platform. Users can create groups and set permissions on their posts (tweets) to control view/edit abilities. This project using technologies like TS, NestJS, GraphQL, PostgrSQL and MongoDB as a NoSQL alternative for DB.

### Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x)
- Docker (for running the application using Docker Compose)

## Solution

- Logic
- Database
- API
- Trade-offs
- Performance Considerations

### Logic

- <b>Group Management</b>: Create/Mutating groups and add users/groups
- <b>Permission Management</b>: View/Edit and inheritence management
- <b>Permission Check</b>: View/Edit and inheritence check
- <b>Tweet Creation</b>: With or without parent
- <b>Tweet Pagination</b>: Sorted by time

### Database Schema

1. Users

- id: UUID
- username: String

2. Groups

- id: UUID
- name String
- user_ids: JSONB
- group_ids: JSONB

3. tweets

- id: UUID
- author_id: UUID
- content: Text
- hashtags: JSONB
- parent_tweet_id: UUID
- category: Enum (Sport, Finance, Tech, News)
- location: String
- created_at: Timestamp

4. Permissions

- tweet_id: UUID
- inherit_view_permissions: Boolian
- inherit_edit_permissions: Boolian
- view_permissions: JSONB
- edit_permissions: JSONB

### API: GraphQL Schema

```graphql
type Query {
  paginateTweets(userId: String!, limit: Int!, page: Int!): PaginatedTweet!
  canEditTweet(userId: String, tweetId: String!): Boolean!
}
type Mutation {
  createGroup(input: CreateGroup!): Group!
  createTweet(input: CreateTwet!): Tweet!
  updateTweetPermissions(input: UpdateTweetPermissions!): Boolean!
}
```

### Trade-offs

#### Flexibility vs. Consistency

- Pros: Allows users to create complex group structures, enhancing the flexibility of the permissions system.
- Cons: Increases the complexity of permission checks, especially with nested groups. Ensuring data consistency across these groups can be challenging.
- Decision: Used recursive methods with caching (TODO) to manage nested group memberships efficiently. This approach maintains flexibility while addressing performance and consistency concerns.

#### Inheritance vs. Explicit Permissions

- Pros: Simplifies permission management for users by automatically applying parent tweet permissions to replies.
- Cons: Adds complexity to the permission check logic, as it requires evaluating the permission hierarchy.
- Decision: Implemented lazy evaluation of inherited permissions to defer complex calculations until necessary. This reduces the performance overhead during permission updates.

#### REST vs. GraphQL API

- Pros: Provides flexibility to clients, allowing them to request only the data they need. Supports complex queries and reduces over-fetching of data.
- Cons: Can introduce complexity in query parsing and execution. May require additional optimizations to handle deeply nested queries.
- Decision: Chose GraphQL for its flexibility and client-side benefits. Implemented query complexity analysis and depth limits to ensure performance remains manageable.

#### Horizontal Scalability vs. Vertical Scalability

- Pros: Allows the system to scale out by adding more instances, improving resilience and load handling.
- Cons: Requires careful management of state and consistency across instances. Increases the complexity of the deployment and monitoring setup.
- Decision: Adopted a microservices architecture to support horizontal scaling. Used stateless services where possible and leveraged distributed caching and database sharding to manage state and consistency.

#### Pagination Strategy

- Pros: More efficient for deep paginations and prevents issues with offset-based pagination, such as missing or duplicate items due to data changes.
- Cons: Adds complexity in managing cursors and ensuring they are stateless and consistent.
- Decision: Implemented cursor-based pagination to enhance performance and reliability for large datasets, ensuring a smooth user experience.

### Performance Considerations

Caching
Careful indexing
Optimized queries

## Installation and Running

After cloning the repo, run this:

```bash
$ npm i
```

Create a .env file for database confing with the following content:

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=yourusername
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=twperm
```

And run this:

```bash
$ npm run migrate
```

After all bu running this, you can see the result in [localhost:2222/graphql](http://localhost:2020/graphql):

```bash
$ npm run start
```

If you are curious about testing the project, you can run:

```bash
$ npm run test
```

### Running with Docker Compose

```sh
docker-compose up --build
```

## Author

[Amir Faghihi](https://faghihy.com)
