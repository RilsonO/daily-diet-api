import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.string('name').notNullable()
    table.string('description').notNullable()
    table.string('date').notNullable()
    table.string('time').notNullable()
    table.boolean('isInDiet').notNullable()

    table.uuid('userId').unsigned().notNullable()
    table.foreign('userId').references('users.id')
    // Outros campos para informações da refeição
    // ...
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('meals')
}
