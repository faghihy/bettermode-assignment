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

SQL vs NoSQL

TypeORM vs Sequelize

GraphQL vs REST

Scalability VS Consistency

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
