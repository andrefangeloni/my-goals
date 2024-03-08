import { useSQLiteContext } from 'expo-sqlite/next'

export type GoalCreateDatabase = {
  name: string
  total: number
}

export type GoalResponseDatabase = {
  id: string
  name: string
  total: number
  current: number
}

export const useGoalRepository = () => {
  const database = useSQLiteContext()

  const create = (goal: GoalCreateDatabase) => {
    try {
      const statement = database.prepareSync(
        'INSERT INTO goals (name, total) VALUES ($name, $total)',
      )

      statement.executeSync({
        $name: goal.name,
        $total: goal.total,
      })
    } catch (e) {
      throw e
    }
  }

  const all = () => {
    try {
      return database.getAllSync<GoalResponseDatabase>(`
        SELECT g.id, g.name, g.total, COALESCE(SUM(t.amount), 0) AS current
        FROM goals AS g
        LEFT JOIN transactions t ON t.goal_id = g.id
        GROUP BY g.id, g.name, g.total;
      `)
    } catch (e) {
      throw e
    }
  }

  const show = (id: number) => {
    try {
      const statement = database.prepareSync(`
        SELECT g.id, g.name, g.total, COALESCE(SUM(t.amount), 0) AS current
        FROM goals AS g
        LEFT JOIN transactions t ON t.goal_id = g.id
        WHERE g.id = $id
        GROUP BY g.id, g.name, g.total;
      `)

      const result = statement.executeSync<GoalResponseDatabase>({ $id: id })

      return result.getFirstSync()
    } catch (e) {
      throw e
    }
  }

  return {
    all,
    show,
    create,
  }
}
