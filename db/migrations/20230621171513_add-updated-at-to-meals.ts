import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('meals', (table) => {
    table.timestamp('updated_at').defaultTo(null)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('meals', (table) => {
    table.dropColumn('updated_at')
  })
}
