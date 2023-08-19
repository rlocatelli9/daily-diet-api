import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('owner').notNullable().index()
    table.uuid('id').primary()
    table.text('title').notNullable()
    table.text('description').nullable()
    table.text('type').notNullable()
    table.datetime('datetime').notNullable()
    table.boolean('in_diet').defaultTo(false).notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.timestamp('deleted_at').nullable()

    table.foreign('owner').references('user_id').inTable('users')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
