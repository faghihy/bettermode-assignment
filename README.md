<p align="center">
  <a href="http://bettermode.com/" target="blank">
    <img src="https://cdn.prod.website-files.com/632a253b6e9c1587d2b8853d/65b1c2aa9d5db8a934a345a9_bettermode-logo-toggle-light.png" width="200" alt="Nest Logo" />
  </a>
</p>

# Bettermode

## Senior Back-End Engineer Project Assignment

This project impliments a permission and group system for X platform. Users can create groups and set permissions on their tweets to control view/edit abilities. This project using technologies like TS, NestJS, GraphQL and PostgrSQL.

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

- <b>Group Management</b>: Mutating groups and group members
- <b>Tweet Management</b>: Query/Mutating tweets and permissions

### Database Schema

1. groups

- id: UUID
- name String
- ownerId: String
- members: GroupMembers[]

2. group_members

- id: UUID
- group: Group
- userId: String
- subGroup: GroupMembers;

3. tweets

- id: UUID
- authorId: String
- content: String
- hashtags: String[]
- parentTweetId: UUID
- category: Enum (Sport, Finance, Tech, News)
- location: String
- parent: Tweet
- replies: Tweet[]
- inheritViewPermission: Boolean
- inheritEditPermission: Boolean
- permissions: TweetPermissions[]
- createdAt: Timestamp

4. tweet_permissions

- id: UUID
- tweet: Tweet
- group: Group
- userId: string
- inherit_view_permissions: Boolean
- inherit_edit_permissions: Boolean

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

#### Examples

Creating a group:

```graphql
mutation {
  createGroup(
    input: {
      name: "Investors"
      ownerId: "1b8285d6-bed8-4fb2-bd5c-33de911600cd"
      userIds: []
      groupIds: []
    }
  ) {
    id
    name
    ownerId
    members {
      id
      userId
      subGroup {
        id
      }
    }
  }
}
```

Creating a Tweet:

```graphql
mutation {
  createTweet(
    input: {
      authorId: "1b8285d6-bed8-4fb2-bd5c-33de911600cd"
      content: "This is a new tweet from an Investor!"
      hashtags: ["Invest"]
      parentTweetId: null
      category: "Tech"
      location: "Canada"
    }
  ) {
    id
    authorId
    content
  }
}
```

Updating Tweet Permissions:

```graphql
mutation {
  updateTweetPermissions(
    input: {
      tweetId: "5f45e5a0-cd27-4a94-aa24-e5a64a6db7ce"
      inheritViewPermissions: true
      inheritEditPermissions: false
      viewPermissions: { userIds: [], groupIds: [] }
      editPermissions: { userIds: [], groupIds: [] }
    }
  )
}
```

Paginating Tweets:

```graphql
query {
  paginateTweets(
    userId: "1b8285d6-bed8-4fb2-bd5c-33de911600cd"
    limit: 10
    page: 1
  ) {
    nodes {
      id
      content
    }
    hasNextPage
  }
}
```

Checking Edit Permissions:

```graphql
query {
  canEditTweet(
    userId: "1b8285d6-bed8-4fb2-bd5c-33de911600cd"
    tweetId: "5f45e5a0-cd27-4a94-aa24-e5a64a6db7ce"
  )
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

#### Database Optimization

- Indexes: Appropriate indexes are created on frequently queried fields such as userId, groupId, tweetId, and createdAt. This improves query performance, especially for read-heavy operations.
- Compound Indexes: Compound indexes on combinations of fields that are commonly queried together (e.g., userId and createdAt) are also created to further enhance performance.
- Normalized Data Models: The database schema is designed with normalization in mind to avoid redundant data storage and to ensure efficient updates and lookups.
- Join Optimization: The schema design minimizes the need for complex joins by structuring the data to optimize common access patterns.

#### Efficient Permission Checks

- Recursive Group Membership Resolution: Recursive methods for resolving group memberships are optimized to prevent excessive database queries.
- Batch Fetching: Batch fetching techniques are used to retrieve all relevant users and groups in a single query rather than multiple round-trips to the database.
- Permission Inheritance: Permissions inheritance logic is implemented with careful attention to minimizing the performance impact.

## Next Steps:

- Performance Monitoring: Continuous performance monitoring can implement using tools like Prometheus and Grafana to track key performance metrics (e.g., response times, database query times, cache hit/miss ratios).
- API Rate Limiting: Rate limiting can implement to prevent abuse and ensure fair usage of the API. This protects the system from being overwhelmed by too many requests in a short period.
- Caching: The permissions for tweets can be cached in Redis when they are first accessed. Subsequent reads fetch the data from Redis rather than hitting the database.

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

After all bu running this, you can see the result in [localhost:2020/graphql](http://localhost:2020/graphql):

```bash
$ npm run start
```

### Running with Docker Compose

```sh
docker-compose up --build
```

## Author

[Amir Faghihi](https://faghihy.com)
